import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FlagReviewDto {
  @ApiPropertyOptional({
    description: 'Reason for flagging this review for admin moderation',
    maxLength: 500,
    example: 'Suspicious or offensive content',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
