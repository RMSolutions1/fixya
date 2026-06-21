'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { useApiAuth } from '@/hooks/use-auth';

export interface AdminFinanceSummary {
  wallet: {
    accounts: number;
    held: number;
    released: number;
    commission: number;
    warranty: number;
    currency: string;
  };
  payments: Array<{ status: string; count: number; totalAmount: number }>;
  engagements: Array<{ status: string; count: number }>;
  commissionRules: Array<{
    id: string;
    name: string;
    ratePercent: number;
    isGlobal: boolean;
    isActive: boolean;
  }>;
  integrations: {
    mercadopago: {
      accessToken: boolean;
      webhookSecret: boolean;
      ready: boolean;
      webhookUrl: string;
    };
    email: { configured: boolean };
  };
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

function financeQueryKey(segment: string, page?: number) {
  return ['admin', 'finance', segment, page ?? 1] as const;
}

export function useAdminFinanceSummary() {
  const { token, tenantId } = useApiAuth();
  return useQuery({
    queryKey: financeQueryKey('summary'),
    queryFn: () =>
      apiRequest<AdminFinanceSummary>('/admin/finance/summary', { token, tenantId }),
    enabled: !!token,
  });
}

export function useAdminFinanceWallets(page = 1) {
  const { token, tenantId } = useApiAuth();
  return useQuery({
    queryKey: financeQueryKey('wallets', page),
    queryFn: () =>
      apiRequest<{ items: unknown[]; meta: PaginatedMeta }>(
        `/admin/finance/wallets?page=${page}&limit=20`,
        { token, tenantId },
      ),
    enabled: !!token,
  });
}

export function useAdminFinancePayments(page = 1) {
  const { token, tenantId } = useApiAuth();
  return useQuery({
    queryKey: financeQueryKey('payments', page),
    queryFn: () =>
      apiRequest<{ items: unknown[]; meta: PaginatedMeta }>(
        `/admin/finance/payments?page=${page}&limit=20`,
        { token, tenantId },
      ),
    enabled: !!token,
  });
}

export function useAdminFinanceLedger(page = 1) {
  const { token, tenantId } = useApiAuth();
  return useQuery({
    queryKey: financeQueryKey('ledger', page),
    queryFn: () =>
      apiRequest<{ entries: unknown[]; meta: PaginatedMeta }>(
        `/admin/finance/ledger?page=${page}&limit=20`,
        { token, tenantId },
      ),
    enabled: !!token,
  });
}

export function useUpdateCommissionRule() {
  const { token, tenantId } = useApiAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ratePercent }: { id: string; ratePercent: number }) =>
      apiRequest(`/admin/finance/commission-rules/${id}`, {
        method: 'PATCH',
        token,
        tenantId,
        body: { ratePercent },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'summary'] });
    },
  });
}
