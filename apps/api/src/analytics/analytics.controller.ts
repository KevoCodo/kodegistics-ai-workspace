import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  async overview() {
    return this.analyticsService.getOverview();
  }

  @Get('workflow-usage')
  async workflowUsage() {
    return this.analyticsService.getWorkflowUsage();
  }

  @Get('recent-activity')
  async recentActivity() {
    return this.analyticsService.getRecentActivity();
  }

  @Get('status-breakdown')
  async statusBreakdown() {
    return this.analyticsService.getStatusBreakdown();
  }
}

