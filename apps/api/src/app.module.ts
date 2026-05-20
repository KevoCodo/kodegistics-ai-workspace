import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowsModule } from './workflows/workflows.module';
import { WorkflowRunsModule } from './workflow-runs/workflow-runs.module';
import { WorkflowLogsModule } from './workflow-logs/workflow-logs.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ProvidersModule } from './providers/providers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/api/.env', 'apps/api/.env.local', '.env', '.env.local'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const portRaw = config.get<string>('DATABASE_PORT') ?? '5432';
        const port = Number.parseInt(portRaw, 10);
        const synchronizeRaw = config.get<string>('TYPEORM_SYNCHRONIZE');
        const synchronize =
          synchronizeRaw != null
            ? synchronizeRaw === 'true'
            : (config.get<string>('NODE_ENV') ?? 'development') !== 'production';

        return {
          type: 'postgres' as const,
          host: config.get<string>('DATABASE_HOST') ?? 'localhost',
          port: Number.isFinite(port) ? port : 5432,
          username: config.get<string>('DATABASE_USER') ?? 'postgres',
          password: config.get<string>('DATABASE_PASSWORD') ?? 'postgres',
          database: config.get<string>('DATABASE_NAME') ?? 'workflow_ai_dashboard',
          autoLoadEntities: true,
          synchronize,
        };
      },
    }),
    WorkflowsModule,
    WorkflowRunsModule,
    WorkflowLogsModule,
    AnalyticsModule,
    ProvidersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
