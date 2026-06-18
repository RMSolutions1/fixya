'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { FALLBACK_CATEGORIES } from '@/lib/fallback-categories';
import { useApiAuth } from '@/hooks/use-auth';

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  serviceCount?: number;
  children?: ServiceCategory[];
}

export interface ServiceReview {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  reviewer?: { firstName: string; lastName: string };
}

export interface Service {
  id: string;
  title: string;
  description: string;
  basePrice: string | null;
  ratingAvg: string;
  ratingCount: number;
  professionalId?: string | null;
  category: { id: string; name: string; slug?: string };
  tenant: { id: string; name: string };
  reviews?: ServiceReview[];
  professional?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
  } | null;
}

export interface ProfessionalSummary {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  verified: boolean;
  pendingApproval?: boolean;
  city?: string | null;
  province?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  specialty: string;
  categories: string[];
  serviceCount: number;
  minPrice: number | null;
  ratingAvg: number;
  ratingCount: number;
  primaryServiceId: string;
  available: boolean;
}

export interface ProfessionalProfile extends ProfessionalSummary {
  bio: string;
  experienceYears: number | null;
  licenseNumber: string | null;
  tenant: { id: string; name: string; slug: string } | null;
  services: Service[];
}

export interface ServiceRequestItem {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  publishedAt?: string | null;
  category: { id: string; name: string; slug: string };
  quotations?: Array<{ id: string; status: string; totalAmount: string }>;
  engagement?: { id: string; status: string } | null;
  _count?: { quotations: number };
  client?: { firstName: string; lastName: string };
}

export interface MarketplaceStats {
  servicesCount: number;
  categoriesCount: number;
  professionalsCount: number;
  verifiedProfessionalsCount?: number;
  completedRequests: number;
}

const fallbackCategories: ServiceCategory[] = FALLBACK_CATEGORIES.map((c) => ({
  id: c.slug,
  name: c.name,
  slug: c.slug,
}));

export function useCategories(enabled = true) {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const data = await apiRequest<ServiceCategory[]>('/marketplace/categories');
        return data?.length ? data : fallbackCategories;
      } catch {
        return fallbackCategories;
      }
    },
    placeholderData: fallbackCategories,
    enabled,
  });
}

export function useServices(
  params?: {
    q?: string;
    categoryId?: string;
    page?: number;
    sortBy?: string;
    minRating?: number;
    minPrice?: number;
    maxPrice?: number;
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
  },
  enabled = true,
) {
  const search = new URLSearchParams();
  if (params?.q) search.set('q', params.q);
  if (params?.categoryId) search.set('categoryId', params.categoryId);
  if (params?.page) search.set('page', String(params.page));
  if (params?.sortBy) search.set('sortBy', params.sortBy);
  if (params?.minRating) search.set('minRating', String(params.minRating));
  if (params?.minPrice) search.set('minPrice', String(params.minPrice));
  if (params?.maxPrice) search.set('maxPrice', String(params.maxPrice));
  if (params?.latitude) search.set('latitude', String(params.latitude));
  if (params?.longitude) search.set('longitude', String(params.longitude));
  if (params?.radiusKm) search.set('radiusKm', String(params.radiusKm));
  const qs = search.toString();

  return useQuery({
    queryKey: ['services', params],
    queryFn: () =>
      apiRequest<{ items: Service[]; meta: { total: number; page: number; pages: number } }>(
        `/marketplace/services${qs ? `?${qs}` : ''}`,
      ),
    enabled,
  });
}

export function useRanking(limit = 10, enabled = true) {
  return useQuery({
    queryKey: ['ranking', limit],
    queryFn: () =>
      apiRequest<
        Array<{
          rank: number;
          serviceId: string;
          title: string;
          tenantName: string;
          ratingAvg: string;
          rankingScore: number;
        }>
      >(`/marketplace/services/ranking?limit=${limit}`),
    enabled,
  });
}

export function useCompareQuotations(requestId: string) {
  const { token, tenantId } = useApiAuth();
  return useQuery({
    queryKey: ['compare', requestId],
    queryFn: () =>
      apiRequest<{
        quotations: Array<QuotationCompare & { isCheapest: boolean; isFastest: boolean; priceVsAvg: number }>;
        summary: { count: number; minPrice: number; maxPrice: number; avgPrice: number; recommendedId: string } | null;
      }>(`/marketplace/requests/${requestId}/compare`, { token, tenantId }),
    enabled: !!requestId && !!token,
  });
}

export function useFavorites() {
  const { token, tenantId } = useApiAuth();
  return useQuery({
    queryKey: ['favorites'],
    queryFn: () => apiRequest<Service[]>('/marketplace/favorites', { token, tenantId }),
    enabled: !!token,
  });
}

export function useToggleFavorite() {
  const { token, tenantId } = useApiAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (serviceId: string) =>
      apiRequest(`/marketplace/favorites/${serviceId}`, {
        method: 'POST',
        token,
        tenantId,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['favorites'] }),
  });
}

interface QuotationCompare {
  id: string;
  totalAmount: string;
  estimatedDays: number;
  professional: { firstName: string; lastName: string };
}


export function useServiceRequest(id: string) {
  const { token, tenantId } = useApiAuth();
  return useQuery({
    queryKey: ['service-request', id],
    queryFn: () =>
      apiRequest<Record<string, unknown>>(`/marketplace/requests/${id}`, {
        token,
        tenantId,
      }),
    enabled: !!id && !!token,
  });
}

export function useCreateServiceRequest() {
  const { token, tenantId } = useApiAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiRequest('/marketplace/requests', {
        method: 'POST',
        body,
        token,
        tenantId,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['service-request'] });
      qc.invalidateQueries({ queryKey: ['service-requests'] });
    },
  });
}

export function usePublishServiceRequest() {
  const { token, tenantId } = useApiAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/marketplace/requests/${id}/publish`, {
        method: 'POST',
        token,
        tenantId,
      }),
    onSuccess: (_, id) => qc.invalidateQueries({ queryKey: ['service-request', id] }),
  });
}

export function useSubmitQuotation() {
  const { token, tenantId } = useApiAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiRequest('/marketplace/quotations', {
        method: 'POST',
        body,
        token,
        tenantId,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['service-request'] }),
  });
}

export function useAcceptQuotation() {
  const { token, tenantId } = useApiAuth();
  return useMutation({
    mutationFn: (quotationId: string) =>
      apiRequest<{ id: string }>(`/engagements/accept-quotation/${quotationId}`, {
        method: 'POST',
        token,
        tenantId,
      }),
  });
}

export function useEngagementExpediente(id: string) {
  const { token, tenantId } = useApiAuth();
  return useQuery({
    queryKey: ['engagement', id],
    queryFn: () =>
      apiRequest<Record<string, unknown>>(`/engagements/${id}/expediente`, {
        token,
        tenantId,
      }),
    enabled: !!id && !!token,
  });
}

export function useWalletBalance(enabled = true) {
  const { token, tenantId } = useApiAuth();
  return useQuery({
    queryKey: ['wallet-balance'],
    queryFn: () =>
      apiRequest<{
        summary: { held: number; released: number; commission: number; warranty: number };
        accounts: Array<{
          id: string;
          engagementId: string;
          status: string;
          heldAmount: string;
          releasedAmount: string;
          commissionAmount: string;
          warrantyHeld: string;
          currency: string;
        }>;
      }>('/wallet/balance', { token, tenantId }),
    enabled: !!token && enabled,
  });
}

export function useWalletLedger(page = 1, limit = 20) {
  const { token, tenantId } = useApiAuth();
  return useQuery({
    queryKey: ['wallet-ledger', page, limit],
    queryFn: () =>
      apiRequest<{
        entries: Array<{
          id: string;
          entryType: string;
          description: string;
          postedAt: string;
          lines: Array<{
            id: string;
            accountCode: string;
            debit: string;
            credit: string;
          }>;
        }>;
        meta: { total: number; page: number; limit: number };
      }>(`/wallet/ledger?page=${page}&limit=${limit}`, { token, tenantId }),
    enabled: !!token,
  });
}

export function useMarketplaceStats(enabled = true) {
  return useQuery({
    queryKey: ['marketplace-stats'],
    queryFn: async () => {
      try {
        return await apiRequest<MarketplaceStats>('/marketplace/stats');
      } catch {
        return {
          categoriesCount: fallbackCategories.length,
          professionalsCount: 0,
          verifiedProfessionalsCount: 0,
          completedRequests: 0,
        };
      }
    },
    placeholderData: {
      categoriesCount: fallbackCategories.length,
      professionalsCount: 0,
      verifiedProfessionalsCount: 0,
      completedRequests: 0,
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useService(id: string, enabled = true) {
  return useQuery({
    queryKey: ['service', id],
    queryFn: () => apiRequest<Service & { reviews?: unknown[]; rankingScore?: number }>(
      `/marketplace/services/${id}`,
    ),
    enabled: !!id && enabled,
  });
}

export function useProfessionals(
  params?: {
    q?: string;
    categoryId?: string;
    categorySlug?: string;
    sortBy?: string;
    page?: number;
    includePending?: boolean;
  },
  enabled = true,
) {
  const search = new URLSearchParams();
  if (params?.q) search.set('q', params.q);
  if (params?.categoryId) search.set('categoryId', params.categoryId);
  if (params?.categorySlug) search.set('categorySlug', params.categorySlug);
  if (params?.sortBy) search.set('sortBy', params.sortBy);
  if (params?.page) search.set('page', String(params.page));
  if (params?.includePending) search.set('includePending', 'true');
  const qs = search.toString();

  return useQuery({
    queryKey: ['professionals', params],
    queryFn: () =>
      apiRequest<{ items: ProfessionalSummary[]; meta: { total: number; pages: number } }>(
        `/marketplace/professionals${qs ? `?${qs}` : ''}`,
      ),
    enabled,
  });
}

export function useProfessional(id: string, enabled = true) {
  return useQuery({
    queryKey: ['professional', id],
    queryFn: () => apiRequest<ProfessionalProfile>(`/marketplace/professionals/${id}`),
    enabled: !!id && enabled,
  });
}

export function useServiceRequests() {
  const { token, tenantId } = useApiAuth();
  return useQuery({
    queryKey: ['service-requests'],
    queryFn: () =>
      apiRequest<{ items: ServiceRequestItem[]; role: 'client' | 'professional' }>(
        '/marketplace/requests',
        { token, tenantId },
      ),
    enabled: !!token,
  });
}

export function useCreateCheckout() {
  const { token, tenantId } = useApiAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (engagementId: string) =>
      apiRequest<{
        mode: 'mercadopago' | 'sandbox';
        paymentId: string;
        checkoutUrl?: string | null;
        preferenceId?: string;
        message?: string;
      }>(`/payments/engagements/${engagementId}/checkout`, {
        method: 'POST',
        token,
        tenantId,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['engagement'] }),
  });
}

export function useConfirmSandboxPayment() {
  const { token, tenantId } = useApiAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: string) =>
      apiRequest(`/payments/sandbox/${paymentId}/confirm`, {
        method: 'POST',
        token,
        tenantId,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['engagement'] });
      qc.invalidateQueries({ queryKey: ['wallet-balance'] });
    },
  });
}

export function useReleaseFunds() {
  const { token, tenantId } = useApiAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (engagementId: string) =>
      apiRequest(`/payments/engagements/${engagementId}/release`, {
        method: 'POST',
        token,
        tenantId,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['engagement'] });
      qc.invalidateQueries({ queryKey: ['wallet-balance'] });
    },
  });
}

export function useListEngagements() {
  const { token, tenantId } = useApiAuth();
  return useQuery({
    queryKey: ['engagements'],
    queryFn: () =>
      apiRequest<
        Array<{
          id: string;
          status: string;
          totalAmount: string;
          currency: string;
          createdAt: string;
          serviceRequest: { title: string; description: string } | null;
          client: { firstName: string; lastName: string };
          professional: { firstName: string; lastName: string };
          payment: { status: string; amount: string } | null;
          walletAccount: { heldAmount: string; releasedAmount: string } | null;
        }>
      >('/engagements', { token, tenantId }),
    enabled: !!token,
  });
}

export function useStartEngagement() {
  const { token, tenantId } = useApiAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (engagementId: string) =>
      apiRequest(`/engagements/${engagementId}/start`, { method: 'POST', token, tenantId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['engagement'] }),
  });
}

export function useCompleteEngagement() {
  const { token, tenantId } = useApiAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ engagementId, note }: { engagementId: string; note?: string }) =>
      apiRequest(`/engagements/${engagementId}/complete`, {
        method: 'POST',
        token,
        tenantId,
        body: { note },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['engagement'] });
      qc.invalidateQueries({ queryKey: ['wallet-balance'] });
    },
  });
}

export function useOpenDispute() {
  const { token, tenantId } = useApiAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ engagementId, reason }: { engagementId: string; reason: string }) =>
      apiRequest(`/engagements/${engagementId}/dispute`, {
        method: 'POST',
        token,
        tenantId,
        body: { reason },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['engagement'] }),
  });
}

export function useCreateReview() {
  const { token, tenantId } = useApiAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { engagementId: string; rating: number; comment?: string }) =>
      apiRequest('/marketplace/reviews', {
        method: 'POST',
        token,
        tenantId,
        body: input,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['engagement'] });
    },
  });
}
