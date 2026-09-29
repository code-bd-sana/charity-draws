import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
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
} from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { QueryNotificationsDto } from './dto/query-notifications.dto';

@ApiTags('Notifications')
@Controller('api/v1/notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly jwtService: JwtService,
  ) {}

  private extractUserId(req: Request): string {
    const userPayload = (req as any).user;
    if (userPayload?.sub) return userPayload.sub;
    if (userPayload?.id) return userPayload.id;

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

  @Get()
  @ApiOperation({ summary: 'Get current user notifications' })
  @ApiResponse({ status: 200, description: 'User notifications list' })
  async getNotifications(
    @Req() req: Request,
    @Query() query: QueryNotificationsDto,
  ) {
    const userId = this.extractUserId(req);
    return this.notificationsService.getUserNotifications(userId, query);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read for current user' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@Req() req: Request) {
    const userId = this.extractUserId(req);
    return this.notificationsService.markAllAsRead(userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a single notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(@Req() req: Request, @Param('id') id: string) {
    const userId = this.extractUserId(req);
    return this.notificationsService.markAsRead(id, userId);
  }

  @Delete('clear-all')
  @ApiOperation({ summary: 'Clear all notifications for current user' })
  @ApiResponse({ status: 200, description: 'All notifications cleared' })
  async clearAllNotifications(@Req() req: Request) {
    const userId = this.extractUserId(req);
    return this.notificationsService.clearAll(userId);
  }

  @Delete('clear-read')
  @ApiOperation({ summary: 'Clear all read notifications for current user' })
  @ApiResponse({ status: 200, description: 'Read notifications cleared' })
  async clearReadNotifications(@Req() req: Request) {
    const userId = this.extractUserId(req);
    return this.notificationsService.clearRead(userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({ status: 200, description: 'Notification deleted' })
  async deleteNotification(@Req() req: Request, @Param('id') id: string) {
    const userId = this.extractUserId(req);
    return this.notificationsService.delete(id, userId);
  }
}
