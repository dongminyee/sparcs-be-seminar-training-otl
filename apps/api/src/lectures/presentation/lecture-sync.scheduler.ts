import { Injectable } from "@nestjs/common";
import { LectureSyncService } from "../service/lecture-sync.service";

@Injectable()
export class LectureSyncScheduler {
  constructor(private readonly lectures: LectureSyncService) {}

  // TODO(04b): Call the sync service on a 10-second cron schedule.
}
