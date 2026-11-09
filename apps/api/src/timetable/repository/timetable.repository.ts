import type { Lecture } from "@mini-otl/contracts";
import { Injectable, NotImplementedException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

@Injectable()
export class TimetableRepository {
  // Replace this file with the supplied Repository after creating the 03 migration.
  findByUser(
    _userId: number,
    _db?: Prisma.TransactionClient,
  ): Promise<Lecture[]> {
    throw new NotImplementedException("시간표 테이블을 먼저 만들어 주세요.");
  }

  add(
    _userId: number,
    _lectureId: number,
    _db: Prisma.TransactionClient,
  ): Promise<void> {
    throw new NotImplementedException("시간표 테이블을 먼저 만들어 주세요.");
  }

  remove(_userId: number, _lectureId: number): Promise<void> {
    throw new NotImplementedException("시간표 테이블을 먼저 만들어 주세요.");
  }

  removeByLecture(_lectureId: number): Promise<void> {
    throw new NotImplementedException("시간표 테이블을 먼저 만들어 주세요.");
  }

  withUserSchedule(
    _userId: number,
    _lectureId: number,
    _work: (db: Prisma.TransactionClient) => Promise<void>,
  ): Promise<void> {
    throw new NotImplementedException("시간표 테이블을 먼저 만들어 주세요.");
  }
}
