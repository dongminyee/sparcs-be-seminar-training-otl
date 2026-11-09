import { ConfigService } from "@mini-otl/env";
import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";
import { SourceService } from "./source.service";

@Injectable()
export class SourceScheduler implements OnApplicationBootstrap {
  private readonly logger = new Logger(SourceScheduler.name);

  constructor(
    private readonly source: SourceService,
    private readonly config: ConfigService,
    private readonly registry: SchedulerRegistry,
  ) {}

  onApplicationBootstrap() {
    const job = CronJob.from({
      cronTime: this.config.getOrThrow<string>("SOURCE_DELETE_CRON"),
      onTick: () => this.requestDeletion(),
      waitForCompletion: true,
    });
    this.registry.addCronJob("source-delete", job);
    job.start();
  }

  async requestDeletion() {
    try {
      const deletedId = await this.source.requestLectureDeletion();
      if (deletedId) this.logger.log(`강의 ${deletedId} 삭제 요청 완료`);
    } catch (error) {
      this.logger.warn(error instanceof Error ? error.message : String(error));
    }
  }
}
