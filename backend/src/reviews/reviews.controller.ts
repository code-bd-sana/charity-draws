import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { FlagReviewDto } from './dto/flag-review.dto';
import { QueryHostReviewsDto } from './dto/query-reviews.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Reviews')
@Controller('api/v1/reviews')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly jwtService: JwtService,
  ) {}

  private extractUserId(req: Request): string {
    const token =
      req.cookies?.accessToken ||
      (req.headers.authorization
        ? req.headers.authorization.replace(/^Bearer\s+/i, '')
        : undefined);
    if (!token) {
      throw new UnauthorizedException('No authentication token found');
    }
    try {
      const payload = this.jwtService.verify(token);
      return payload.sub;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * 1. Submit a verified winner review (Protected)
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a verified winner review' })
  @ApiResponse({ status: 201, description: 'Review successfully created' })
  @ApiResponse({ status: 400, description: 'Duplicate review or invalid data' })
  @ApiResponse({ status: 403, description: 'Not owner of the won prize' })
  @ApiResponse({ status: 404, description: 'Winner prize record not found' })
  async createReview(@Req() req: Request, @Body() dto: CreateReviewDto) {
    const userId = this.extractUserId(req);
    return this.reviewsService.create(userId, dto);
  }

  /**
   * 2. Get reviews for a specific host with aggregated stats (Public)
   */
  @Get('host/:hostId')
  @ApiOperation({ summary: 'Get public reviews and aggregated ratings for a host' })
  @ApiParam({ name: 'hostId', description: 'Host ID or Slug' })
  @ApiResponse({ status: 200, description: 'Paginated reviews and rating statistics' })
  @ApiResponse({ status: 404, description: 'Host not found' })
  async getHostReviews(
    @Param('hostId') hostId: string,
    @Query() query: QueryHostReviewsDto,
  ) {
    return this.reviewsService.getHostReviews(hostId, query);
  }

  /**
   * 3. Get my submitted reviews (Protected)
   */
  @Get('my-reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all reviews submitted by the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of submitted reviews' })
  async getMyReviews(@Req() req: Request) {
    const userId = this.extractUserId(req);
    return this.reviewsService.getMyReviews(userId);
  }

  /**
   * 4. Host Dashboard Reviews & Satisfaction metrics (Protected - Host only)
   */
  @Get('host-dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get reviews and metrics for the host dashboard' })
  @ApiResponse({ status: 200, description: 'Host reviews and rating metrics' })
  async getHostDashboard(@Req() req: Request) {
    const userId = this.extractUserId(req);
    return this.reviewsService.getHostDashboardReviews(userId);
  }

  /**
   * 5a. Edit a review comment / rating (Protected)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit review rating and comment' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({ status: 200, description: 'Review updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden to edit other users reviews' })
  async updateReview(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
  ) {
    const userId = this.extractUserId(req);
    return this.reviewsService.update(id, userId, dto);
  }

  /**
   * 5b. Flag review for admin moderation (Protected)
   */
  @Post(':id/flag')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Flag suspicious review for admin moderation' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({ status: 200, description: 'Review flagged' })
  async flagReview(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: FlagReviewDto,
  ) {
    const userId = this.extractUserId(req);
    return this.reviewsService.flag(id, userId, dto);
  }
}
