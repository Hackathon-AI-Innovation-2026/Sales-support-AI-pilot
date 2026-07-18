import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { LeadScoringService } from './lead-scoring.service';

@Module({
  imports: [DatabaseModule],
  controllers: [LeadsController],
  providers: [LeadsService, LeadScoringService],
  exports: [LeadsService],
})
export class LeadsModule {}
