import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateReviewDto {
  @ApiPropertyOptional({
    description: 'Updated rating score from 1 to 5 stars',
    minimum: 1,
    maximum: 5,
    example: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({
    description: 'Updated feedback text / comment',
    maxLength: 1000,
    example: 'Updated feedback: Everything was delivered promptly and safely.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}
