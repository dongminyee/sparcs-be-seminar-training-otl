import { Controller, Delete, Get, NotImplementedException, Post } from '@nestjs/common';

@Controller('lectures/:lectureId/reviews')
export class ReviewsController {
  @Get()
  findAll() {
    // TODO(7): List reviews for an active lecture. This route is public.
    throw new NotImplementedException('강의 리뷰 조회 실습을 진행해 주세요.');
  }

  @Post()
  create() {
    // TODO(7): Require a JWT and allow one review per user and lecture.
    throw new NotImplementedException('강의 리뷰 작성 실습을 진행해 주세요.');
  }

  @Delete(':reviewId')
  remove() {
    // TODO(7): Compare the review author with the authenticated user and return 403 on mismatch.
    throw new NotImplementedException('강의 리뷰 삭제 실습을 진행해 주세요.');
  }

  @Post(':reviewId/heart')
  addHeart() {
    // TODO(8): Insert a heart and update the review's count in the same transaction.
    throw new NotImplementedException('리뷰 하트 실습을 진행해 주세요.');
  }

  @Delete(':reviewId/heart')
  removeHeart() {
    // TODO(8): Remove the heart and update the review's count in the same transaction.
    throw new NotImplementedException('리뷰 하트 취소 실습을 진행해 주세요.');
  }
}
