import { ConflictException } from "@nestjs/common";
import type { Lecture } from "@mini-otl/contracts";

export class TimetableConflictException extends ConflictException {
  constructor(conflict: Pick<Lecture, "id" | "title">) {
    super({
      statusCode: 409,
      code: "TIMETABLE_CONFLICT",
      message: `"${conflict.title}" 강의와 수업 시간이 겹쳐 담을 수 없습니다.`,
      conflictingLectureId: conflict.id,
    });
  }
}
