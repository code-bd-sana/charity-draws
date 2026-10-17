import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignTicketsDto {
  @ApiProperty({ description: 'ID of the target active raffle/competition' })
  @IsNotEmpty()
  @IsString()
  raffleId: string;

  @ApiProperty({ description: 'ID of the recipient user' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiPropertyOptional({
    description: 'Specific ticket numbers to assign (e.g. [7, 14, 21])',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Type(() => Number)
  ticketNumbers?: number[];

  @ApiPropertyOptional({
    description: 'Quantity of random available ticket numbers to assign if numbers are omitted',
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity?: number;

  @ApiPropertyOptional({
    description: 'Admin note or audit reason for the assignment (e.g. Giveaway prize, Loyalty reward)',
    type: String,
  })
  @IsOptional()
  @IsString()
  adminNotes?: string;
}
