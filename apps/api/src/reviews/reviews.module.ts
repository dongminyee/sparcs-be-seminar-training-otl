import { Module } from "@nestjs/common";
import { ReviewsController } from "./presentation/reviews.controller";

@Module({ controllers: [ReviewsController] })
export class ReviewsModule {}
