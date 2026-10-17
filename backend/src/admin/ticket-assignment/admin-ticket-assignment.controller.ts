import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminTicketAssignmentService } from './admin-ticket-assignment.service';
import { QueryCompetitionsDto } from './dto/query-competitions.dto';
import { AssignTicketsDto } from './dto/assign-tickets.dto';
import { QueryHistoryDto } from './dto/query-history.dto';

@ApiTags('Admin - Manual Ticket Assignment')
@ApiBearerAuth()
@Controller('api/v1/admin/ticket-assignment')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminTicketAssignmentController {
  constructor(
    private readonly assignmentService: AdminTicketAssignmentService,
  ) {}

  @Get('competitions')
  @ApiOperation({
    summary: 'List active competitions for manual ticket assignment (Admin only)',
  })
  @ApiResponse({ status: 200, description: 'List of active competitions' })
  async getActiveCompetitions(@Query() query: QueryCompetitionsDto) {
    return this.assignmentService.getActiveCompetitions(query);
  }

  @Get('competitions/:id')
  @ApiOperation({
    summary: 'Get competition details including sold tickets and instant win grid (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Competition/Raffle ID' })
  @ApiResponse({ status: 200, description: 'Detailed competition data' })
  @ApiResponse({ status: 404, description: 'Competition not found' })
  async getCompetitionDetails(@Param('id') id: string) {
    return this.assignmentService.getCompetitionDetails(id);
  }

  @Get('users/search')
  @ApiOperation({
    summary: 'Live autocomplete search active users for assignment (Admin only)',
  })
  @ApiQuery({ name: 'q', required: false, description: 'Search term for name/email/id' })
  @ApiResponse({ status: 200, description: 'List of matching active users' })
  async searchUsers(@Query('q') q?: string) {
    return this.assignmentService.searchUsers(q);
  }

  @Post('assign')
  @ApiOperation({
    summary: 'Manually assign tickets to a user with financial crediting & instant win automation (Admin only)',
  })
  @ApiResponse({ status: 201, description: 'Tickets successfully assigned' })
  @ApiResponse({ status: 400, description: 'Validation failed or tickets conflict' })
  @ApiResponse({ status: 404, description: 'Competition or user not found' })
  async assignTickets(@Body() body: AssignTicketsDto, @Req() req: any) {
    const adminId = req.user?.sub || req.user?.id || 'admin';
    return this.assignmentService.assignTickets(body, adminId);
  }

  @Get('history')
  @ApiOperation({
    summary: 'Paginated audit history of manual ticket assignments (Admin only)',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of manual assignments' })
  async getAssignmentHistory(@Query() query: QueryHistoryDto) {
    return this.assignmentService.getAssignmentHistory(query);
  }
}
