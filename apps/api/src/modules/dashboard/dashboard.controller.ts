import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  async getSummary() {
    return this.dashboardService.getSummary();
  }

  @Get('funnel')
  async getFunnel() {
    return this.dashboardService.getFunnel();
  }

  @Get('hot-leads')
  async getHotLeads(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return this.dashboardService.getHotLeads(limitNum);
  }

  @Get('conversion-rate')
  async getConversionRate() {
    return this.dashboardService.getConversionRate();
  }

  @Get('revenue-forecast')
  async getRevenueForecast() {
    return this.dashboardService.getRevenueForecast();
  }
}
