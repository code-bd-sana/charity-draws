import { IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateReviewDto {
  @ApiProperty({
    description: 'Unique ID of the won prize/order record',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  winnerId: string;

  @ApiProperty({
    description: 'Rating score from 1 to 5 stars',
    minimum: 1,
    maximum: 5,
    example: 5,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({
    description: 'Optional feedback text / comment',
    maxLength: 1000,
    example: 'Great competition! Fast delivery and great communication.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}
