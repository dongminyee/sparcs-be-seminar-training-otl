import "reflect-metadata";
import { ConfigService } from "@mini-otl/env";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  app.enableShutdownHooks();
  const port = app.get(ConfigService).getOrThrow<string>("API_PORT");
  await app.listen(Number(port), "127.0.0.1");
}

void bootstrap();
