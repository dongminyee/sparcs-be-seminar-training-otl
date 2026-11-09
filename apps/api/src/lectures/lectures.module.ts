import { Module } from "@nestjs/common";
import { LecturesController } from "./presentation/lectures.controller";
import { LectureRepository } from "./repository/lecture.repository";
import { LecturesService } from "./service/lectures.service";
import { ScheduleModule } from "@nestjs/schedule";
import { DatabaseModule } from "../database/database.module";
import { LectureSyncScheduler } from "./presentation/lecture-sync.scheduler";
import { LectureSyncRepository } from "./repository/lecture-sync.repository";
import { LectureSyncService } from "./service/lecture-sync.service";

@Module({
  imports: [ScheduleModule.forRoot(), DatabaseModule],
  controllers: [LecturesController],
  providers: [
    LectureRepository,
    LecturesService,
    LectureSyncRepository,
    LectureSyncService,
    LectureSyncScheduler,
  ],
  exports: [LectureRepository],
})
export class LecturesModule {}
