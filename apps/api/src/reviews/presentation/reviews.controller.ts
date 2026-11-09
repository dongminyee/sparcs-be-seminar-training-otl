import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { reviewContentLimit, reviewContentSchema } from "@mini-otl/contracts";
import { JwtAuthGuard } from "../../auth/presentation/jwt-auth.guard";
import { OptionalJwtAuthGuard } from "../../auth/presentation/optional-jwt-auth.guard";
import type { AuthenticatedUser } from "../../auth/presentation/jwt.strategy";
import { ResourceIdPipe } from "../../common/resource-id.pipe";
import { ReviewsService } from "../service/reviews.service";

type ReviewRequest = { user: AuthenticatedUser };

@Controller("lectures/:lectureId/reviews")
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @Header("Cache-Control", "no-store")
  findAll(
    @Param("lectureId", ResourceIdPipe) lectureId: number,
    @Req() { user }: Partial<ReviewRequest>,
  ) {
    return this.reviews.findAll(lectureId, user?.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Param("lectureId", ResourceIdPipe) lectureId: number,
    @Req() { user }: ReviewRequest,
    @Body() body?: { content?: unknown },
  ) {
    const content = reviewContentSchema.safeParse(body?.content);
    if (!content.success)
      throw new BadRequestException(
        `리뷰를 1–${reviewContentLimit}자로 입력해 주세요.`,
      );
    return this.reviews.create(lectureId, user.id, content.data);
  }

  @Delete(":reviewId")
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  remove(
    @Param("lectureId", ResourceIdPipe) lectureId: number,
    @Param("reviewId", ResourceIdPipe) reviewId: number,
    @Req() { user }: ReviewRequest,
  ) {
    return this.reviews.remove(lectureId, reviewId, user.id);
  }

  @Post(":reviewId/heart")
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  addHeart(
    @Param("lectureId", ResourceIdPipe) lectureId: number,
    @Param("reviewId", ResourceIdPipe) reviewId: number,
    @Req() { user }: ReviewRequest,
  ) {
    return this.reviews.setHeart(lectureId, reviewId, user.id, true);
  }

  @Delete(":reviewId/heart")
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  removeHeart(
    @Param("lectureId", ResourceIdPipe) lectureId: number,
    @Param("reviewId", ResourceIdPipe) reviewId: number,
    @Req() { user }: ReviewRequest,
  ) {
    return this.reviews.setHeart(lectureId, reviewId, user.id, false);
  }
}
