import { Module, forwardRef } from '@nestjs/common';
import { RecommendationController } from './recommendation.controller';
import { RecommendationService } from './recommendation.service';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AiModule)],
  controllers: [RecommendationController],
  providers: [RecommendationService],
  exports: [RecommendationService],
})
export class RecommendationModule {}
