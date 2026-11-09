import { Injectable, NotImplementedException } from "@nestjs/common";
import { LectureSyncRepository } from "../repository/lecture-sync.repository";

@Injectable()
export class LectureSyncService {
  constructor(private readonly lectures: LectureSyncRepository) {}

  async sync(): Promise<void> {
    // TODO(04a): Fetch the feed and save each lecture.
    throw new NotImplementedException("개설강의 동기화 실습을 진행해 주세요.");
  }
}
