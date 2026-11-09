import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { OptionalJwtAuthGuard } from "../auth/presentation/optional-jwt-auth.guard";
import { DatabaseModule } from "../database/database.module";
import { LecturesModule } from "../lectures/lectures.module";
import { ReviewsController } from "./presentation/reviews.controller";
import { ReviewRepository } from "./repository/review.repository";
import { ReviewsService } from "./service/reviews.service";

@Module({
  imports: [AuthModule, DatabaseModule, LecturesModule],
  controllers: [ReviewsController],
  providers: [ReviewRepository, ReviewsService, OptionalJwtAuthGuard],
})
export class ReviewsModule {}
