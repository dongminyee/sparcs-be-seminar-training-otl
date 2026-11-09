import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { SourceService } from "./source.service";

@Injectable()
export class SourceScheduler {
  private readonly logger = new Logger(SourceScheduler.name);

  constructor(private readonly source: SourceService) {}

  @Cron("*/30 * * * * *")
  async requestDeletion() {
    const deletedId = await this.source.requestLectureDeletion();
    if (deletedId) this.logger.log(`강의 ${deletedId} 삭제 요청 완료`);
  }
}
