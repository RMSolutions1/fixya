import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@fixya/database';
import { PrismaService } from '../../../database/prisma.service';
import { SearchServicesQueryDto } from '../dto/marketplace.dto';

export class SearchServicesQuery {
  constructor(public readonly params: SearchServicesQueryDto) {}
}

/** Aproximación bounding box para filtro geo (sin PostGIS en dev) */
function geoBoundingBox(lat: number, lng: number, radiusKm: number) {
  const latDelta = radiusKm / 111;
  const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
  return {
    latitude: { gte: lat - latDelta, lte: lat + latDelta },
    longitude: { gte: lng - lngDelta, lte: lng + lngDelta },
  };
}

@QueryHandler(SearchServicesQuery)
export class SearchServicesHandler implements IQueryHandler<SearchServicesQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: SearchServicesQuery) {
    const {
      q,
      categoryId,
      minPrice,
      maxPrice,
      minRating,
      latitude,
      longitude,
      radiusKm = 25,
      sortBy = 'rating',
      page = 1,
      limit = 20,
    } = query.params;
    const skip = (page - 1) * limit;

    const where: Prisma.ServiceWhereInput = {
      status: 'ACTIVE',
      deletedAt: null,
      ...(categoryId && { categoryId }),
      ...(q && {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      }),
      ...(minPrice !== undefined && { basePrice: { gte: minPrice } }),
      ...(maxPrice !== undefined && {
        basePrice: { ...(minPrice !== undefined ? { gte: minPrice } : {}), lte: maxPrice },
      }),
      ...(minRating !== undefined && { ratingAvg: { gte: minRating } }),
      ...(latitude !== undefined &&
        longitude !== undefined &&
        geoBoundingBox(latitude, longitude, radiusKm)),
    };

    const orderBy: Prisma.ServiceOrderByWithRelationInput =
      sortBy === 'price_asc'
        ? { basePrice: 'asc' }
        : sortBy === 'price_desc'
          ? { basePrice: 'desc' }
          : sortBy === 'newest'
            ? { createdAt: 'desc' }
            : { ratingAvg: 'desc' };

    const [items, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          tenant: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.prisma.service.count({ where }),
    ]);

    const enriched = items.map((s) => {
      let distanceKm: number | null = null;
      if (
        latitude !== undefined &&
        longitude !== undefined &&
        s.latitude !== null &&
        s.longitude !== null
      ) {
        const lat1 = (latitude * Math.PI) / 180;
        const lat2 = (Number(s.latitude) * Math.PI) / 180;
        const dLat = lat2 - lat1;
        const dLng = ((Number(s.longitude) - longitude) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
        distanceKm = Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
      }
      return {
        ...s,
        distanceKm,
        rankingScore: computeRankingScore(Number(s.ratingAvg), s.ratingCount),
      };
    });

    if (latitude !== undefined && longitude !== undefined) {
      enriched.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
    }

    return {
      items: enriched,
      meta: { total, page, limit, pages: Math.ceil(total / limit), sortBy },
    };
  }
}

function computeRankingScore(rating: number, count: number): number {
  return Math.round((rating * 0.7 + Math.min(count / 50, 1) * 5 * 0.3) * 100) / 100;
}

export class GetServiceRequestQuery {
  constructor(public readonly id: string) {}
}

@QueryHandler(GetServiceRequestQuery)
export class GetServiceRequestHandler
  implements IQueryHandler<GetServiceRequestQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetServiceRequestQuery) {
    return this.prisma.serviceRequest.findFirst({
      where: { id: query.id, deletedAt: null },
      include: {
        quotations: {
          where: { deletedAt: null },
          include: {
            items: true,
            professional: {
              select: { id: true, firstName: true, lastName: true, avatarUrl: true },
            },
          },
          orderBy: { totalAmount: 'asc' },
        },
      },
    });
  }
}

export class CompareQuotationsQuery {
  constructor(public readonly serviceRequestId: string) {}
}

@QueryHandler(CompareQuotationsQuery)
export class CompareQuotationsHandler
  implements IQueryHandler<CompareQuotationsQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: CompareQuotationsQuery) {
    const quotations = await this.prisma.quotation.findMany({
      where: {
        serviceRequestId: query.serviceRequestId,
        status: 'SUBMITTED',
        deletedAt: null,
      },
      include: {
        items: true,
        professional: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
      orderBy: { totalAmount: 'asc' },
    });

    if (quotations.length === 0) return { quotations: [], summary: null };

    const amounts = quotations.map((q) => Number(q.totalAmount));
    const days = quotations.map((q) => q.estimatedDays);
    const cheapest = quotations[0];
    const fastest = [...quotations].sort((a, b) => a.estimatedDays - b.estimatedDays)[0];

    return {
      quotations: quotations.map((q) => ({
        ...q,
        isCheapest: q.id === cheapest.id,
        isFastest: q.id === fastest.id,
        priceVsAvg: Math.round(((Number(q.totalAmount) - avg(amounts)) / avg(amounts)) * 100),
      })),
      summary: {
        count: quotations.length,
        minPrice: Math.min(...amounts),
        maxPrice: Math.max(...amounts),
        avgPrice: Math.round(avg(amounts)),
        minDays: Math.min(...days),
        maxDays: Math.max(...days),
        recommendedId: cheapest.id,
      },
    };
  }
}

function avg(nums: number[]) {
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export class ListCategoriesQuery {}

@QueryHandler(ListCategoriesQuery)
export class ListCategoriesHandler implements IQueryHandler<ListCategoriesQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    const categories = await this.prisma.serviceCategory.findMany({
      where: { isActive: true, deletedAt: null, parentId: null },
      include: {
        children: { where: { isActive: true } },
        _count: {
          select: {
            services: { where: { status: 'ACTIVE', deletedAt: null } },
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return categories.map(({ _count, ...cat }) => ({
      ...cat,
      serviceCount: _count.services,
    }));
  }
}

export class GetRankingQuery {
  constructor(public readonly limit = 10) {}
}

@QueryHandler(GetRankingQuery)
export class GetRankingHandler implements IQueryHandler<GetRankingQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetRankingQuery) {
    const services = await this.prisma.service.findMany({
      where: { status: 'ACTIVE', deletedAt: null, ratingCount: { gt: 0 } },
      take: query.limit,
      orderBy: [{ ratingAvg: 'desc' }, { ratingCount: 'desc' }],
      include: {
        tenant: { select: { id: true, name: true } },
        category: { select: { name: true } },
      },
    });

    return services.map((s, index) => ({
      rank: index + 1,
      serviceId: s.id,
      title: s.title,
      tenantName: s.tenant.name,
      categoryName: s.category.name,
      ratingAvg: s.ratingAvg,
      ratingCount: s.ratingCount,
      rankingScore: computeRankingScore(Number(s.ratingAvg), s.ratingCount),
    }));
  }
}

export class GetServiceByIdQuery {
  constructor(public readonly id: string) {}
}

@QueryHandler(GetServiceByIdQuery)
export class GetServiceByIdHandler implements IQueryHandler<GetServiceByIdQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetServiceByIdQuery) {
    const service = await this.prisma.service.findFirst({
      where: { id: query.id, status: 'ACTIVE', deletedAt: null },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        tenant: { select: { id: true, name: true, slug: true } },
        reviews: {
          where: { deletedAt: null },
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            reviewer: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!service) return null;

    let professional = null;
    if (service.professionalId) {
      professional = await this.prisma.user.findUnique({
        where: { id: service.professionalId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatarUrl: true,
          emailVerified: true,
        },
      });
    }

    return {
      ...service,
      professional,
      rankingScore: computeRankingScore(Number(service.ratingAvg), service.ratingCount),
    };
  }
}

export class ListProfessionalsQuery {
  constructor(
    public readonly params: import('../dto/marketplace.dto').ListProfessionalsQueryDto,
  ) {}
}

@QueryHandler(ListProfessionalsQuery)
export class ListProfessionalsHandler implements IQueryHandler<ListProfessionalsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListProfessionalsQuery) {
    const { q, categoryId, categorySlug, sortBy = 'rating', page = 1, limit = 20, includePending = false } =
      query.params;
    const skip = (page - 1) * limit;

    let resolvedCategoryId = categoryId;
    if (categorySlug && !resolvedCategoryId) {
      const cat = await this.prisma.serviceCategory.findFirst({
        where: { slug: categorySlug, isActive: true, deletedAt: null },
      });
      resolvedCategoryId = cat?.id;
    }

    const serviceWhere: Prisma.ServiceWhereInput = {
      status: includePending ? { in: ['ACTIVE', 'DRAFT'] } : 'ACTIVE',
      deletedAt: null,
      professionalId: { not: null },
      ...(resolvedCategoryId && { categoryId: resolvedCategoryId }),
    };

    const services = await this.prisma.service.findMany({
      where: serviceWhere,
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    const byProfessional = new Map<
      string,
      {
        id: string;
        services: typeof services;
        minPrice: number | null;
        maxRating: number;
        totalReviews: number;
        categories: Set<string>;
      }
    >();

    for (const s of services) {
      if (!s.professionalId) continue;
      const entry = byProfessional.get(s.professionalId) ?? {
        id: s.professionalId,
        services: [],
        minPrice: null,
        maxRating: 0,
        totalReviews: 0,
        categories: new Set<string>(),
      };
      entry.services.push(s);
      if (s.basePrice !== null) {
        const price = Number(s.basePrice);
        entry.minPrice = entry.minPrice === null ? price : Math.min(entry.minPrice, price);
      }
      entry.maxRating = Math.max(entry.maxRating, Number(s.ratingAvg));
      entry.totalReviews += s.ratingCount;
      entry.categories.add(s.category.name);
      byProfessional.set(s.professionalId, entry);
    }

    const professionalIds = [...byProfessional.keys()];
    if (professionalIds.length === 0) {
      return { items: [], meta: { total: 0, page, limit, pages: 0 } };
    }

    const users = await this.prisma.user.findMany({
      where: {
        id: { in: professionalIds },
        deletedAt: null,
        status: includePending ? { in: ['ACTIVE', 'PENDING_VERIFICATION'] } : 'ACTIVE',
        ...(q && {
          OR: [
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } },
          ],
        }),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        emailVerified: true,
        status: true,
        city: true,
        province: true,
      },
    });

    let items = users.map((u) => {
      const agg = byProfessional.get(u.id)!;
      const primary = agg.services[0];
      return {
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        phone: u.phone,
        avatarUrl: u.avatarUrl,
        verified: u.emailVerified && u.status === 'ACTIVE',
        pendingApproval: u.status === 'PENDING_VERIFICATION' || primary.status === 'DRAFT',
        city: u.city,
        province: u.province,
        latitude: primary.latitude ? Number(primary.latitude) : null,
        longitude: primary.longitude ? Number(primary.longitude) : null,
        specialty: primary.category.name,
        categories: [...agg.categories],
        serviceCount: agg.services.length,
        minPrice: agg.minPrice,
        ratingAvg: agg.maxRating,
        ratingCount: agg.totalReviews,
        primaryServiceId: primary.id,
        available: u.status === 'ACTIVE' && primary.status === 'ACTIVE',
      };
    });

    if (sortBy === 'price_asc') {
      items.sort((a, b) => (a.minPrice ?? 999999) - (b.minPrice ?? 999999));
    } else if (sortBy === 'price_desc') {
      items.sort((a, b) => (b.minPrice ?? 0) - (a.minPrice ?? 0));
    } else if (sortBy === 'newest') {
      items.sort((a, b) => b.serviceCount - a.serviceCount);
    } else {
      items.sort((a, b) => b.ratingAvg - a.ratingAvg || b.ratingCount - a.ratingCount);
    }

    const total = items.length;
    items = items.slice(skip, skip + limit);

    return {
      items,
      meta: { total, page, limit, pages: Math.ceil(total / limit), sortBy },
    };
  }
}

export class GetProfessionalByIdQuery {
  constructor(public readonly id: string) {}
}

@QueryHandler(GetProfessionalByIdQuery)
export class GetProfessionalByIdHandler
  implements IQueryHandler<GetProfessionalByIdQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetProfessionalByIdQuery) {
    const user = await this.prisma.user.findFirst({
      where: { id: query.id, deletedAt: null, status: 'ACTIVE' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        emailVerified: true,
        createdAt: true,
        memberships: {
          where: { isActive: true, role: 'PROFESIONAL' },
          select: { tenant: { select: { id: true, name: true, slug: true } } },
        },
      },
    });

    if (!user) return null;

    const services = await this.prisma.service.findMany({
      where: { professionalId: query.id, status: 'ACTIVE', deletedAt: null },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        reviews: {
          where: { deletedAt: null },
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { reviewer: { select: { firstName: true, lastName: true } } },
        },
      },
      orderBy: { ratingAvg: 'desc' },
    });

    if (services.length === 0) return null;

    const ratingAvg =
      services.reduce((sum, s) => sum + Number(s.ratingAvg), 0) / services.length;
    const ratingCount = services.reduce((sum, s) => sum + s.ratingCount, 0);
    const minPrice = services.reduce<number | null>((min, s) => {
      if (s.basePrice === null) return min;
      const p = Number(s.basePrice);
      return min === null ? p : Math.min(min, p);
    }, null);

    const metadata = (services[0]?.metadata ?? {}) as Record<string, unknown>;

    return {
      ...user,
      verified: user.emailVerified,
      tenant: user.memberships[0]?.tenant ?? null,
      bio: (metadata.bio as string) ?? services[0].description.slice(0, 200),
      experienceYears: (metadata.experienceYears as number) ?? null,
      licenseNumber: (metadata.licenseNumber as string) ?? null,
      services,
      ratingAvg: Math.round(ratingAvg * 100) / 100,
      ratingCount,
      minPrice,
      available: true,
    };
  }
}

export class ListServiceRequestsQuery {
  constructor(
    public readonly userId: string,
    public readonly roles: string[],
  ) {}
}

@QueryHandler(ListServiceRequestsQuery)
export class ListServiceRequestsHandler
  implements IQueryHandler<ListServiceRequestsQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListServiceRequestsQuery) {
    const isProfessional =
      query.roles.includes('PROFESIONAL') || query.roles.includes('EMPRESA');

    if (isProfessional) {
      const items = await this.prisma.serviceRequest.findMany({
        where: { status: 'PUBLISHED', deletedAt: null },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          client: { select: { firstName: true, lastName: true } },
          quotations: {
            where: { professionalId: query.userId, deletedAt: null },
            select: { id: true, status: true, totalAmount: true },
          },
          _count: { select: { quotations: true } },
        },
        orderBy: { publishedAt: 'desc' },
        take: 50,
      });
      return { items, role: 'professional' as const };
    }

    const items = await this.prisma.serviceRequest.findMany({
      where: { clientId: query.userId, deletedAt: null },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        quotations: {
          where: { deletedAt: null },
          select: { id: true, status: true, totalAmount: true },
        },
        engagement: { select: { id: true, status: true } },
        _count: { select: { quotations: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { items, role: 'client' as const };
  }
}

export class GetMarketplaceStatsQuery {}

@QueryHandler(GetMarketplaceStatsQuery)
export class GetMarketplaceStatsHandler
  implements IQueryHandler<GetMarketplaceStatsQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    const [servicesCount, categoriesCount, professionalsCount, requestsCount] =
      await Promise.all([
        this.prisma.service.count({ where: { status: 'ACTIVE', deletedAt: null } }),
        this.prisma.serviceCategory.count({
          where: { isActive: true, deletedAt: null, parentId: null },
        }),
        this.prisma.service.groupBy({
          by: ['professionalId'],
          where: { status: 'ACTIVE', deletedAt: null, professionalId: { not: null } },
        }),
        this.prisma.serviceRequest.count({
          where: { status: 'CLOSED', deletedAt: null },
        }),
      ]);

    return {
      servicesCount,
      categoriesCount,
      professionalsCount: professionalsCount.length,
      verifiedProfessionalsCount: await this.prisma.user.count({
        where: { status: 'ACTIVE', deletedAt: null, memberships: { some: { role: 'PROFESIONAL' } } },
      }),
      completedRequests: requestsCount,
    };
  }
}

export class ListFavoritesQuery {
  constructor(public readonly userId: string) {}
}

@QueryHandler(ListFavoritesQuery)
export class ListFavoritesHandler implements IQueryHandler<ListFavoritesQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListFavoritesQuery) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId: query.userId, serviceId: { not: null } },
      include: {
        service: {
          include: {
            category: { select: { name: true } },
            tenant: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return favorites.map((f) => f.service).filter(Boolean);
  }
}
