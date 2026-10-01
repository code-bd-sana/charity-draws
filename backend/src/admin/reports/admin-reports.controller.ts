import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminReportsService } from './admin-reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Admin - Reports & Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('api/v1/admin/reports')
export class AdminReportsController {
  constructor(private readonly adminReportsService: AdminReportsService) {}

  @Get('analytics')
  @ApiOperation({ summary: 'Get comprehensive platform performance reports and analytics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Reports & Analytics payload successfully retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getAnalytics(@Query('period') period?: string) {
    return this.adminReportsService.getAnalytics(period);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export performance report as CSV (Admin only)' })
  @ApiResponse({ status: 200, description: 'CSV file download' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async exportCsv(@Query('period') period: string = '3M', @Res({ passthrough: true }) res: any) {
    const csvData = await this.adminReportsService.generateCsvReport(period);
    const filename = `charity-draws-report-${period.toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return csvData;
  }
}
