import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { LeadScoringService } from './lead-scoring.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadScoringController {
  constructor(private readonly leadScoringService: LeadScoringService) {}

  @Post(':id/score')
  async scoreLead(@Param('id') id: string) {
    return this.leadScoringService.scoreLead(id);
  }

  @Get(':id/scores')
  async getScoreHistory(@Param('id') id: string) {
    return this.leadScoringService.getScoreHistory(id);
  }

  @Get(':id/score')
  async getLatestScore(@Param('id') id: string) {
    return this.leadScoringService.getLatestScore(id);
  }
}
