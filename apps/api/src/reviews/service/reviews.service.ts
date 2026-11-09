import { Injectable, NotImplementedException } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { LectureRepository } from "../../lectures/repository/lecture.repository";
import { ReviewRepository } from "../repository/review.repository";

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviews: ReviewRepository,
    private readonly lectures: LectureRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(_lectureId: number, _viewerId?: number) {
    // TODO(07a): Check that the lecture is active and list its reviews.
    throw new NotImplementedException("리뷰 조회를 구현해 주세요.");
  }

  async create(_lectureId: number, _userId: number, _content: string) {
    // TODO(07b): Create a review and report a duplicate as a conflict.
    throw new NotImplementedException("리뷰 작성을 구현해 주세요.");
  }

  async remove(
    _lectureId: number,
    _reviewId: number,
    _userId: number,
  ): Promise<void> {
    // TODO(07c): Verify authorship before deleting the review.
    throw new NotImplementedException("리뷰 삭제를 구현해 주세요.");
  }

  async setHeart(
    _lectureId: number,
    _reviewId: number,
    _userId: number,
    _hearted: boolean,
  ): Promise<void> {
    // TODO(08b): Add or remove the heart and update its count in one transaction.
    throw new NotImplementedException("리뷰 하트를 구현해 주세요.");
  }
}
