import { Module, forwardRef } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { RecommendationModule } from '../recommendation/recommendation.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => RecommendationModule)],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
