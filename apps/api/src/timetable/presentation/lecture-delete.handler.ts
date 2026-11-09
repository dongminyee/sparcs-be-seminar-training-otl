import { Injectable } from "@nestjs/common";
import { TimetableService } from "../service/timetable.service";

@Injectable()
export class LectureDeleteHandler {
  constructor(private readonly timetable: TimetableService) {}

  // TODO(05b): Subscribe to LectureDeleteEvent and call the timetable service.
}
