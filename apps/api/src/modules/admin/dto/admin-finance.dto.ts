import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class AdminFinancePaginationDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class UpdateCommissionRuleDto {
  @ApiProperty({ description: 'Tasa decimal (ej. 0.08 = 8%)', example: 0.08 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(0.5)
  ratePercent!: number;
}
