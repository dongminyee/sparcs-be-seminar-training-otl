import { Injectable, NotImplementedException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { LectureRepository } from "../repository/lecture.repository";

@Injectable()
export class LecturesService {
  constructor(
    private readonly lectures: LectureRepository,
    private readonly events: EventEmitter2,
  ) {}

  findAll(){
    return this.lectures.findActiveAll();
  }
  
  async deleteLecture(_id: number): Promise<void> {
    // TODO(05a): Mark the lecture as deleted and publish its event.
    throw new NotImplementedException("강의 삭제 실습을 진행해 주세요.");
  }
}
