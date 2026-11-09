import "reflect-metadata";
import { ConfigService, EnvModule } from "@mini-otl/env";
import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";
import { SourceController } from "./source.controller";
import { SourceScheduler } from "./source.scheduler";
import { SourceService } from "./source.service";

@Module({
  imports: [EnvModule, ScheduleModule.forRoot()],
  controllers: [SourceController],
  providers: [SourceService, SourceScheduler],
})
class SourceModule {}

async function bootstrap() {
  const app = await NestFactory.create(SourceModule);
  app.setGlobalPrefix("api");
  app.enableShutdownHooks();
  const port = app.get(ConfigService).getOrThrow<string>("SOURCE_PORT");
  await app.listen(Number(port), "127.0.0.1");
}

void bootstrap();
