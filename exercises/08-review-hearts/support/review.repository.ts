import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";

const reviewSelection = {
  id: true,
  lectureId: true,
  author: { select: { id: true, name: true } },
  content: true,
  createdAt: true,
  heartCount: true,
} satisfies Prisma.ReviewSelect;

@Injectable()
export class ReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findForLecture(lectureId: number, viewerId?: number) {
    const reviews = await this.prisma.review.findMany({
      where: { lectureId },
      orderBy: { id: "desc" },
      select: {
        ...reviewSelection,
        hearts:
          viewerId === undefined
            ? false
            : { where: { userId: viewerId }, select: { userId: true } },
      },
    });
    return reviews.map(({ hearts, ...review }) => ({
      ...review,
      heartedByMe: Boolean(hearts?.length),
    }));
  }

  async create(lectureId: number, userId: number, content: string) {
    try {
      const review = await this.prisma.review.create({
        data: { lectureId, userId, content },
        select: reviewSelection,
      });
      return { ...review, heartedByMe: false };
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
    lectureId: number,
    reviewId: number,
    db: Prisma.TransactionClient,
  ) {
    // Lock the review before mutating its hearts so concurrent writes serialize.
    const [review] = await db.$queryRaw<{ userId: number }[]>`
      SELECT userId FROM review
      WHERE id = ${reviewId} AND lectureId = ${lectureId}
      FOR UPDATE
    `;
    return review ?? null;
  }

  remove(reviewId: number) {
    return this.prisma.review.deleteMany({ where: { id: reviewId } });
  }

  addHeart(reviewId: number, userId: number, db: Prisma.TransactionClient) {
    return db.reviewHeart.createMany({
      data: { reviewId, userId },
      skipDuplicates: true,
    });
  }

  removeHeart(reviewId: number, userId: number, db: Prisma.TransactionClient) {
    return db.reviewHeart.deleteMany({ where: { reviewId, userId } });
  }

  async changeHeartCount(
    reviewId: number,
    delta: 1 | -1,
    db: Prisma.TransactionClient,
  ) {
    await db.review.update({
      where: { id: reviewId },
      data: { heartCount: { increment: delta } },
    });
  }
}
