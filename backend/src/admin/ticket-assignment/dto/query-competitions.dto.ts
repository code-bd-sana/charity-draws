import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryCompetitionsDto {
  @ApiPropertyOptional({ description: 'Search term for competition title or slug' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Search term alias' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Filter by host profile ID' })
  @IsOptional()
  @IsString()
  hostId?: string;
}
