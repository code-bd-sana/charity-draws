import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { PurchaseTicketsDto } from './dto/purchase-tickets.dto';
import { CheckoutDto } from './dto/checkout.dto';

@ApiTags('Tickets')
@Controller('api/v1/tickets')
export class TicketsController {
  constructor(
    private readonly ticketsService: TicketsService,
    private readonly jwtService: JwtService,
  ) {}

  private extractUserId(req: Request): string {
    const token = req.cookies?.accessToken;
    if (!token)
      throw new UnauthorizedException('No authentication token found');
    try {
      const payload = this.jwtService.verify(token);
      return payload.sub;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENT', 'USER', 'HOST', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Checkout basket with contact and shipping details' })
  @ApiResponse({ status: 201, description: 'Tickets successfully purchased' })
  @ApiResponse({
    status: 400,
    description: 'Insufficient tickets or invalid quantity',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async checkout(
    @Req() req: Request,
    @Body() body: CheckoutDto,
  ) {
    const userId = this.extractUserId(req);
    return this.ticketsService.checkout(userId, body);
  }

  @Post('purchase/:raffleId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENT', 'USER', 'HOST', 'ADMIN') // Allow any logged-in user to buy
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Purchase tickets for a competition' })
  @ApiParam({
    name: 'raffleId',
    description: 'The unique ID of the raffle/competition',
  })
  @ApiResponse({ status: 201, description: 'Tickets successfully purchased' })
  @ApiResponse({
    status: 400,
    description: 'Insufficient tickets or invalid quantity',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Raffle not found' })
  async purchaseTickets(
    @Req() req: Request,
    @Param('raffleId') raffleId: string,
    @Body() body: PurchaseTicketsDto,
  ) {
    if (!body.quantity || body.quantity < 1) {
      throw new BadRequestException(
        'Quantity is required and must be at least 1',
      );
    }
    const userId = this.extractUserId(req);
    return this.ticketsService.purchaseTickets(userId, raffleId, body.quantity);
  }

  @Get('my-tickets')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all tickets purchased by the current user' })
  @ApiResponse({ status: 200, description: 'List of purchased tickets' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyTickets(@Req() req: Request) {
    const userId = this.extractUserId(req);
    return this.ticketsService.getUserTickets(userId);
  }
}
