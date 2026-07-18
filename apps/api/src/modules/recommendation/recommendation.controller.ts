import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('leads')
@UseGuards(JwtAuthGuard)
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Post(':id/recommend-product')
  async recommendProduct(@Param('id') id: string) {
    return this.recommendationService.recommendProduct(id);
  }

  @Post(':id/next-best-action')
  async getNextBestAction(@Param('id') id: string) {
    return this.recommendationService.getNextBestAction(id);
  }

  @Get(':id/recommendations')
  async getRecommendations(@Param('id') id: string) {
    return this.recommendationService.getRecommendations(id);
  }
}
