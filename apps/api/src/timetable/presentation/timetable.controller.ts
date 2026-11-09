import { Controller, Delete, Get, NotImplementedException, Post } from '@nestjs/common';

@Controller('timetable')
export class TimetableController {
  @Get()
  findMine() {
    // TODO(3): Model and migrate the User–Lecture relation with Prisma.
    // TODO(4): Apply the JWT guard and read the current user's lectures.
    throw new NotImplementedException('내 시간표 조회 실습을 진행해 주세요.');
  }

  @Post('lectures/:id')
  addLecture() {
    // TODO(4): Add the lecture to the authenticated user's timetable.
    throw new NotImplementedException('시간표 강의 추가 실습을 진행해 주세요.');
  }

  @Delete('lectures/:id')
  removeLecture() {
    // TODO(4): Remove the lecture from the authenticated user's timetable.
    throw new NotImplementedException('시간표 강의 제거 실습을 진행해 주세요.');
  }
}
