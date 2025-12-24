import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import configuration from './config/configuration';

import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from './logger/logger.module';
import { UsersModule } from './modules/users/users.module';
import { DatabaseModule } from './modules/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { BrandsModule } from './modules/brands/brands.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { BrandsModule } from './modules/brands/brands.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env.production'],
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        return {
          connection: {
            host: cfg.get<string>('REDIS_HOST', '127.0.0.1'),
            port: parseInt(cfg.get<string>('REDIS_PORT', '6379'), 10),
            password: cfg.get<string>('REDIS_PASSWORD') || undefined,
            ...(cfg.get('REDIS_TLS') === 'true' ? { tls: {} } : {}),
          },
        };
      },
    }),
    ScheduleModule.forRoot(),
    LoggerModule,
    UsersModule,
    DatabaseModule,
    AuthModule,
    BrandsModule,
    CategoriesModule,
  ],
  controllers: [AppController],
  // providers: [{ provide: APP_FILTER, useClass: AllExceptionFilter }],
})
export class AppModule {}
