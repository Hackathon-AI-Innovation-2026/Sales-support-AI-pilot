import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { validateEnv } from './config';
import { DatabaseModule } from './infrastructure/database';
import { MailModule } from './infrastructure/mail';
import { StorageModule } from './infrastructure/storage/storage.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CustomersModule } from './modules/customers/customers.module';
import { LeadsModule } from './modules/leads/leads.module';
import { LeadScoringModule } from './modules/lead-scoring/lead-scoring.module';
import { RecommendationModule } from './modules/recommendation/recommendation.module';
import { AiModule } from './modules/ai/ai.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      cache: true,
      validate: validateEnv,
    }),
    DatabaseModule,
    MailModule,
    StorageModule,
    AuthModule,
    UsersModule,
    CustomersModule,
    LeadsModule,
    LeadScoringModule,
    RecommendationModule,
    AiModule,
    TasksModule,
    DashboardModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
