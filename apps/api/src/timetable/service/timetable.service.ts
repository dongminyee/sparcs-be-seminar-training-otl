import type { Lecture } from "@mini-otl/contracts";
import { Injectable, NotImplementedException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { LectureRepository } from "../../lectures/repository/lecture.repository";
import { TimetableRepository } from "../repository/timetable.repository";

@Injectable()
export class TimetableService {
  constructor(
    private readonly timetable: TimetableRepository,
    private readonly lectures: LectureRepository,
  ) {}

  findMine(_userId: number): Promise<Lecture[]> {
    // TODO(03b): Return the lectures for the authenticated user.
    throw new NotImplementedException("내 시간표 조회를 구현해 주세요.");
  }

  addTimetableLecture(userId: number, lectureId: number) {
    return this.timetable.withUserSchedule(userId, lectureId, db =>
      this.addIfAvailable(userId, lectureId, db),
    );
  }

  private async addIfAvailable(
    _userId: number,
    _lectureId: number,
    _db: Prisma.TransactionClient,
  ): Promise<void> {
    // TODO(06a): Check the lecture and existing slots before inserting.
    throw new NotImplementedException("시간표 담기를 구현해 주세요.");
  }

  async removeLecture(_userId: number, _lectureId: number): Promise<void> {
    // TODO(06b): Remove only this user's timetable entry.
    throw new NotImplementedException("시간표 빼기를 구현해 주세요.");
  }

  removeDeletedLecture(lectureId: number) {
    return this.timetable.removeByLecture(lectureId);
  }
}
