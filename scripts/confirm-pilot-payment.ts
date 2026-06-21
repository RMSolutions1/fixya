/**
 * Confirma pago piloto en DB (cuando MP no está activo en producción).
 * Replica la lógica de PaymentProcessorService.confirmPayment.
 *
 * Uso:
 *   PILOT_CONFIRM=1 ENGAGEMENT_ID=uuid npm run pilot:confirm-payment
 */
import { PrismaClient, PaymentStatus, EngagementStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  if (process.env.PILOT_CONFIRM !== '1') {
    throw new Error('Definí PILOT_CONFIRM=1 para confirmar pago piloto');
  }

  const engagementId = process.env.ENGAGEMENT_ID?.trim();
  if (!engagementId) throw new Error('Definí ENGAGEMENT_ID');

  const payment = await prisma.payment.findFirst({
    where: { engagementId },
    include: { engagement: true },
  });
  if (!payment) throw new Error('Pago no encontrado para la contratación');
  if (payment.status === PaymentStatus.APPROVED) {
    console.log('✓ Pago ya confirmado');
    return;
  }

  const amount = Number(payment.amount);
  const commissionRule = await prisma.commissionRule.findFirst({
    where: { isGlobal: true, isActive: true },
  });
  const rate = Number(commissionRule?.ratePercent ?? 0.08);
  const commission = Math.round(amount * rate * 100) / 100;
  const netHeld = Math.round((amount - commission) * 100) / 100;

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.APPROVED,
        mpPaymentId: `pilot-${payment.id.slice(0, 8)}`,
        paidAt: new Date(),
      },
    });

    await tx.engagement.update({
      where: { id: engagementId },
      data: { status: EngagementStatus.FUNDS_HELD },
    });

    const wallet = await tx.walletAccount.upsert({
      where: { engagementId },
      create: {
        tenantId: payment.tenantId,
        engagementId,
        heldAmount: netHeld,
        commissionAmount: commission,
        currency: payment.currency,
      },
      update: { heldAmount: netHeld, commissionAmount: commission },
    });

    await tx.ledgerEntry.create({
      data: {
        tenantId: payment.tenantId,
        walletAccountId: wallet.id,
        entryNumber: `LE-PILOT-${Date.now()}`,
        entryType: 'PAYMENT_RECEIVED',
        description: `Pago piloto — engagement ${engagementId.slice(0, 8)}`,
        referenceType: 'Payment',
        referenceId: payment.id,
        postedAt: new Date(),
        lines: {
          create: [
            { accountCode: '1100', accountName: 'Fondos retenidos', debit: netHeld, credit: 0 },
            { accountCode: '4100', accountName: 'Comisión FixYa', debit: commission, credit: 0 },
            { accountCode: '2100', accountName: 'Pasivo clientes', debit: 0, credit: amount },
          ],
        },
      },
    });

    await tx.walletEvent.create({
      data: {
        tenantId: payment.tenantId,
        walletAccountId: wallet.id,
        sequence: 1,
        eventType: 'FUNDS_HELD',
        payload: { paymentId: payment.id, amount, commission, pilot: true },
      },
    });

    await tx.engagementTimelineEvent.create({
      data: {
        engagementId,
        tenantId: payment.tenantId,
        eventType: 'PaymentConfirmed',
        payload: { paymentId: payment.id, amount, pilot: true },
      },
    });
  });

  console.log(`✓ Pago piloto confirmado — $${amount} ARS (comisión $${commission})`);
  console.log(`  Expediente: https://fixya.emprenor.com/engagements/${engagementId}`);
}

main()
  .catch((err) => {
    console.error(err.message || err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
