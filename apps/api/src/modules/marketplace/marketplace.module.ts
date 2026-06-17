import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MarketplaceController } from './marketplace.controller';
import {
  CreateServiceRequestHandler,
  PublishServiceRequestHandler,
  SubmitQuotationHandler,
  CreateReviewHandler,
} from './commands/marketplace.commands';
import {
  SearchServicesHandler,
  GetServiceRequestHandler,
  ListCategoriesHandler,
  CompareQuotationsHandler,
  GetRankingHandler,
  ListFavoritesHandler,
  GetServiceByIdHandler,
  ListProfessionalsHandler,
  GetProfessionalByIdHandler,
  ListServiceRequestsHandler,
  GetMarketplaceStatsHandler,
} from './queries/marketplace.queries';
import { ToggleFavoriteHandler } from './commands/favorites.commands';

const CommandHandlers = [
  CreateServiceRequestHandler,
  PublishServiceRequestHandler,
  SubmitQuotationHandler,
  CreateReviewHandler,
  ToggleFavoriteHandler,
];

const QueryHandlers = [
  SearchServicesHandler,
  GetServiceRequestHandler,
  ListCategoriesHandler,
  CompareQuotationsHandler,
  GetRankingHandler,
  ListFavoritesHandler,
  GetServiceByIdHandler,
  ListProfessionalsHandler,
  GetProfessionalByIdHandler,
  ListServiceRequestsHandler,
  GetMarketplaceStatsHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [MarketplaceController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class MarketplaceModule {}
