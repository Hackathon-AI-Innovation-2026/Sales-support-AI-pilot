import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { validateEnv } from './config';
import { DatabaseModule } from './infrastructure/database';
import { MailModule } from './infrastructure/mail';
import { StorageModule } from './infrastructure/storage/storage.module';

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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
