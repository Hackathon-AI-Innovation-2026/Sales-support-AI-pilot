import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService } from '../ai/ai.service';
import { ProductRecommendationDto } from '../ai/dtos/ai.dto';

@Controller('leads')
@UseGuards(JwtAuthGuard)
export class RecommendationController {
  constructor(
    private readonly recommendationService: RecommendationService,
    private readonly aiService: AiService,
  ) {}

  /**
   * Rule-based product recommendation (legacy)
   */
  @Post(':id/recommend-product')
  async recommendProduct(@Param('id') id: string) {
    return this.recommendationService.recommendProduct(id);
  }

  /**
   * AI-powered product recommendation using RAG
   * Uses vector database and LLM to generate personalized recommendations
   */
  @Post(':id/recommend-product-ai')
  async recommendProductAI(@Param('id') id: string) {
    return this.aiService.generateProductRecommendations({ leadId: id } as ProductRecommendationDto);
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
