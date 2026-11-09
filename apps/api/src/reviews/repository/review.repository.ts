import { Injectable, NotImplementedException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";

const reviewSelection = {
  id: true,
  lectureId: true,
  author: { select: { id: true, name: true } },
  content: true,
  createdAt: true,
} satisfies Prisma.ReviewSelect;

@Injectable()
export class ReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  findForLecture(lectureId: number, _viewerId?: number) {
    return this.prisma.review.findMany({
      where: { lectureId },
      orderBy: { id: "desc" },
      select: reviewSelection,
    });
  }

  async create(lectureId: number, userId: number, content: string) {
    try {
      return await this.prisma.review.create({
        data: { lectureId, userId, content },
        select: reviewSelection,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return null;
      }
      throw error;
    }
  }

  findAuthor(lectureId: number, reviewId: number) {
    return this.prisma.review.findUnique({
      where: { id: reviewId, lectureId },
      select: { userId: true },
    });
  }

  async findAuthorForHeart(
    _lectureId: number,
    _reviewId: number,
    _db: Prisma.TransactionClient,
  ): Promise<{ userId: number } | null> {
    throw new NotImplementedException("리뷰 하트 Repository를 적용해 주세요.");
  }

  remove(reviewId: number) {
    return this.prisma.review.deleteMany({ where: { id: reviewId } });
  }

  async addHeart(
    _reviewId: number,
    _userId: number,
    _db: Prisma.TransactionClient,
  ): Promise<Prisma.BatchPayload> {
    throw new NotImplementedException("리뷰 하트 Repository를 적용해 주세요.");
  }

  async removeHeart(
    _reviewId: number,
    _userId: number,
    _db: Prisma.TransactionClient,
  ): Promise<Prisma.BatchPayload> {
    throw new NotImplementedException("리뷰 하트 Repository를 적용해 주세요.");
  }

  async changeHeartCount(
    _reviewId: number,
    _delta: 1 | -1,
    _db: Prisma.TransactionClient,
  ): Promise<void> {
    throw new NotImplementedException("리뷰 하트 Repository를 적용해 주세요.");
  }
}
