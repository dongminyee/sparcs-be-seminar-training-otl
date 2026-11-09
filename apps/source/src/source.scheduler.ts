import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { SourceService } from "./source.service";

@Injectable()
export class SourceScheduler {
  private readonly logger = new Logger(SourceScheduler.name);

  constructor(private readonly source: SourceService) {}

  @Cron(process.env.SOURCE_DELETE_CRON ?? "*/30 * * * * *", {
    waitForCompletion: true,
  })
  async requestDeletion() {
    try {
      const deletedId = await this.source.requestLectureDeletion();
      if (deletedId) this.logger.log(`강의 ${deletedId} 삭제 요청 완료`);
    } catch (error) {
      this.logger.warn(error instanceof Error ? error.message : String(error));
    }
  }
}
