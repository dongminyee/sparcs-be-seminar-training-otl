import { Controller, Delete, Get, NotImplementedException } from '@nestjs/common';

@Controller('lectures')
export class LecturesController {
  @Get()
  findAll() {
    // TODO(1): Read active lectures and their class times through the service and repository.
    throw new NotImplementedException('개설강의 조회 실습을 진행해 주세요.');
  }

  @Delete(':id')
  deleteLecture() {
    // TODO(6): Authenticate the source, delete the lecture, then publish LectureDeleteEvent.
    throw new NotImplementedException('강의 삭제 이벤트 실습을 진행해 주세요.');
  }
}
