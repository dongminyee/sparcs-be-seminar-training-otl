import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { SourceController } from './source.controller';
import { SourceScheduler } from './source.scheduler';
import { SourceService } from './source.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [SourceController],
  providers: [SourceService, SourceScheduler],
})
class SourceModule {}

async function bootstrap() {
  const app = await NestFactory.create(SourceModule);
  app.setGlobalPrefix('api');
  app.enableShutdownHooks();
  await app.listen(Number(process.env.SOURCE_PORT ?? 3002), '127.0.0.1');
}

void bootstrap();
