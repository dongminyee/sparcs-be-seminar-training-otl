import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../database/database.module";
import { LecturesModule } from "../lectures/lectures.module";
import { LectureDeleteHandler } from "./presentation/lecture-delete.handler";
import { TimetableController } from "./presentation/timetable.controller";
import { TimetableRepository } from "./repository/timetable.repository";
import { TimetableService } from "./service/timetable.service";

@Module({
  imports: [AuthModule, DatabaseModule, LecturesModule],
  controllers: [TimetableController],
  providers: [TimetableRepository, TimetableService, LectureDeleteHandler],
  exports: [TimetableService],
})
export class TimetableModule {}
