import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { WalletController } from './wallet.controller';
import { GetWalletBalanceHandler, GetLedgerHandler } from './wallet.handlers';

@Module({
  imports: [CqrsModule],
  controllers: [WalletController],
  providers: [GetWalletBalanceHandler, GetLedgerHandler],
})
export class WalletModule {}
