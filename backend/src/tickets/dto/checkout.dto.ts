import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CheckoutItemDto {
  @ApiProperty({ description: 'The unique ID of the competition' })
  @IsString()
  @IsNotEmpty()
  raffleId: string;

  @ApiProperty({ description: 'Quantity of tickets to purchase', minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class ContactInfoDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+44 7700 900123' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ example: '1995-06-15' })
  @IsString()
  @IsOptional()
  dateOfBirth?: string;
}

export class ShippingAddressDto {
  @ApiProperty({ example: '10 Downing Street' })
  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @ApiPropertyOptional({ example: 'Apartment 4B' })
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @ApiProperty({ example: 'London' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'SW1A 2AA' })
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @ApiPropertyOptional({ example: 'United Kingdom' })
  @IsString()
  @IsOptional()
  country?: string;
}

export class CheckoutDto {
  @ApiProperty({ type: [CheckoutItemDto], description: 'Items in the checkout basket' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items: CheckoutItemDto[];

  @ApiProperty({ type: ContactInfoDto, description: 'Customer contact information' })
  @ValidateNested()
  @Type(() => ContactInfoDto)
  contactInfo: ContactInfoDto;

  @ApiProperty({ type: ShippingAddressDto, description: 'Prize delivery shipping address' })
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;
}
