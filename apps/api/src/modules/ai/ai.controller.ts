import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Res,
  Inject,
  UseGuards,
  forwardRef,
} from '@nestjs/common';
import * as express from 'express';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RecommendationService } from '../recommendation/recommendation.service';
import {
  GenerateEmailDto,
  GeneratePitchDto,
  ChatDto,
  GeneratedContentQueryDto,
  ProductRecommendationDto,
  NextBestActionDto,
} from './dtos/ai.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(
    private readonly aiService: AiService,
    @Inject(forwardRef(() => RecommendationService))
    private readonly recommendationService: RecommendationService,
  ) {}

  @Post('ai/generate-email')
  async generateEmail(@Body() dto: GenerateEmailDto) {
    return this.aiService.generateEmail(dto);
  }

  @Post('ai/generate-pitch')
  async generatePitch(@Body() dto: GeneratePitchDto) {
    return this.aiService.generatePitch(dto);
  }

  @Post('ai/chat')
  async chatStream(@Body() dto: ChatDto, @Res() res: express.Response) {
    return this.aiService.chatStream(dto, res);
  }

  @Get('leads/:id/generated-content')
  async getGeneratedContent(
    @Param('id') id: string,
    @Query() query: GeneratedContentQueryDto,
  ) {
    return this.aiService.getGeneratedContent(id, query);
  }

  @Get('ai/product-recommendations/:leadId')
  async getProductRecommendations(@Param('leadId') leadId: string) {
    return this.aiService.generateProductRecommendations({ leadId });
  }

  @Post('ai/next-best-action/:leadId')
  async getNextBestAction(
    @Param('leadId') leadId: string,
    @Body() dto: NextBestActionDto,
  ) {
    return this.recommendationService.getNextBestAction(leadId, dto.recentNoteContext);
  }
}
