import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  NotFoundException,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MemberRole } from '@fixya/database';
import {
  CreateServiceRequestDto,
  SubmitQuotationDto,
  SearchServicesQueryDto,
  ListProfessionalsQueryDto,
  CreateReviewDto,
  NearbyProfessionalsQueryDto,
  NearbyStatsQueryDto,
} from './dto/marketplace.dto';
import {
  CreateServiceRequestCommand,
  PublishServiceRequestCommand,
  SubmitQuotationCommand,
  CreateReviewCommand,
} from './commands/marketplace.commands';
import {
  SearchServicesQuery,
  GetServiceRequestQuery,
  ListCategoriesQuery,
  CompareQuotationsQuery,
  GetRankingQuery,
  ListFavoritesQuery,
  GetServiceByIdQuery,
  ListProfessionalsQuery,
  GetProfessionalByIdQuery,
  ListServiceRequestsQuery,
  GetMarketplaceStatsQuery,
  NearbyProfessionalsQuery,
  NearbyStatsQuery,
} from './queries/marketplace.queries';
import { ToggleFavoriteCommand } from './commands/favorites.commands';
import { CurrentUser, Roles, Public } from '../../common/decorators/auth.decorators';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import {
  getRegistriesForCategory,
  getRegistriesForProvince,
} from '../../common/data/professional-registries';
import { getPlatformIntegrationsStatus } from '../../common/integrations/integration-status';

@ApiTags('Marketplace')
@ApiBearerAuth()
@Controller('marketplace')
export class MarketplaceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('categories')
  @Public()
  @ApiOperation({ summary: 'Listar categorías de servicios' })
  listCategories() {
    return this.queryBus.execute(new ListCategoriesQuery());
  }

  @Get('stats')
  @Public()
  @ApiOperation({ summary: 'Estadísticas públicas del marketplace' })
  getStats() {
    return this.queryBus.execute(new GetMarketplaceStatsQuery());
  }

  @Get('integrations')
  @Public()
  @ApiOperation({ summary: 'Estado de integraciones (Mercado Pago, email)' })
  getIntegrations() {
    return getPlatformIntegrationsStatus();
  }

  @Get('services/ranking')
  @Public()
  @ApiOperation({ summary: 'Top servicios por ranking' })
  getRanking(@Query('limit') limit?: number) {
    return this.queryBus.execute(new GetRankingQuery(limit ? Number(limit) : 10));
  }

  @Get('services/:id')
  @Public()
  @ApiOperation({ summary: 'Detalle de servicio' })
  async getService(@Param('id', ParseUUIDPipe) id: string) {
    const service = await this.queryBus.execute(new GetServiceByIdQuery(id));
    if (!service) throw new NotFoundException('Servicio no encontrado');
    return service;
  }

  @Get('services')
  @Public()
  @ApiOperation({ summary: 'Buscar servicios (filtros avanzados + geo)' })
  searchServices(@Query() query: SearchServicesQueryDto) {
    return this.queryBus.execute(new SearchServicesQuery(query));
  }

  @Get('professionals')
  @Public()
  @ApiOperation({ summary: 'Listar profesionales verificados' })
  listProfessionals(@Query() query: ListProfessionalsQueryDto) {
    return this.queryBus.execute(new ListProfessionalsQuery(query));
  }

  @Get('registries')
  @Public()
  @ApiOperation({ summary: 'Organismos habilitantes y consultas públicas por rubro' })
  listRegistries(
    @Query('categorySlug') categorySlug?: string,
    @Query('province') province?: string,
  ) {
    if (categorySlug && province) {
      return getRegistriesForProvince(categorySlug, province);
    }
    return getRegistriesForCategory(categorySlug);
  }

  @Get('nearby/stats')
  @Public()
  @ApiOperation({ summary: 'Profesionales y rubros cerca del usuario' })
  nearbyStats(@Query() query: NearbyStatsQueryDto) {
    return this.queryBus.execute(new NearbyStatsQuery(query));
  }

  @Get('nearby/professionals')
  @Public()
  @ApiOperation({ summary: 'Profesionales verificados cerca del usuario' })
  nearbyProfessionals(@Query() query: NearbyProfessionalsQueryDto) {
    return this.queryBus.execute(new NearbyProfessionalsQuery(query));
  }

  @Get('professionals/:id')
  @Public()
  @ApiOperation({ summary: 'Perfil de profesional' })
  async getProfessional(@Param('id', ParseUUIDPipe) id: string) {
    const professional = await this.queryBus.execute(new GetProfessionalByIdQuery(id));
    if (!professional) throw new NotFoundException('Profesional no encontrado');
    return professional;
  }

  @Get('requests')
  @ApiOperation({ summary: 'Mis solicitudes (cliente) u oportunidades (profesional)' })
  listRequests(@CurrentUser() user: JwtPayload) {
    return this.queryBus.execute(
      new ListServiceRequestsQuery(user.sub, user.roles ?? []),
    );
  }

  @Get('requests/:id/compare')
  @ApiOperation({ summary: 'Comparador de presupuestos' })
  compareQuotations(@Param('id', ParseUUIDPipe) id: string) {
    return this.queryBus.execute(new CompareQuotationsQuery(id));
  }

  @Get('favorites')
  @ApiOperation({ summary: 'Mis favoritos' })
  listFavorites(@CurrentUser() user: JwtPayload) {
    return this.queryBus.execute(new ListFavoritesQuery(user.sub));
  }

  @Post('favorites/:serviceId')
  @ApiOperation({ summary: 'Toggle favorito' })
  toggleFavorite(
    @CurrentUser() user: JwtPayload,
    @Param('serviceId', ParseUUIDPipe) serviceId: string,
  ) {
    return this.commandBus.execute(new ToggleFavoriteCommand(user.sub, serviceId));
  }

  @Post('requests')
  @Roles(MemberRole.CLIENTE)
  @ApiOperation({ summary: 'Crear solicitud de servicio' })
  createRequest(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateServiceRequestDto,
  ) {
    return this.commandBus.execute(
      new CreateServiceRequestCommand(user.sub, dto),
    );
  }

  @Post('requests/:id/publish')
  @Roles(MemberRole.CLIENTE)
  @ApiOperation({ summary: 'Publicar solicitud' })
  publishRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.commandBus.execute(
      new PublishServiceRequestCommand(id, user.sub),
    );
  }

  @Get('requests/:id')
  @ApiOperation({ summary: 'Obtener solicitud con cotizaciones' })
  getRequest(@Param('id', ParseUUIDPipe) id: string) {
    return this.queryBus.execute(new GetServiceRequestQuery(id));
  }

  @Post('quotations')
  @Roles(MemberRole.PROFESIONAL, MemberRole.EMPRESA)
  @ApiOperation({ summary: 'Enviar presupuesto' })
  submitQuotation(
    @CurrentUser() user: JwtPayload,
    @Body() dto: SubmitQuotationDto,
  ) {
    return this.commandBus.execute(
      new SubmitQuotationCommand(user.sub, user.tenantId, dto),
    );
  }

  @Post('reviews')
  @Roles(MemberRole.CLIENTE)
  @ApiOperation({ summary: 'Reseñar una contratación completada' })
  createReview(@CurrentUser() user: JwtPayload, @Body() dto: CreateReviewDto) {
    return this.commandBus.execute(new CreateReviewCommand(user.sub, dto));
  }
}
