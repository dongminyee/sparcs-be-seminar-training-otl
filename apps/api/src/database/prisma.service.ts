import { ConfigService } from "@mini-otl/env";
import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(config: ConfigService) {
    super({ datasourceUrl: config.getOrThrow<string>("DATABASE_URL") });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
