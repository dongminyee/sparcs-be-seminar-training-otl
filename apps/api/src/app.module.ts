import { EnvModule } from "@mini-otl/env";
import { TransactionsModule } from "./database/transactions.module";
import { Controller, Get, Module } from "@nestjs/common";
import { LecturesModule } from "./lectures/lectures.module";
import { AuthModule } from "./auth/auth.module";
import { TimetableModule } from "./timetable/timetable.module";
import { ReviewsModule } from "./reviews/reviews.module";

@Controller("health")
class HealthController {
  @Get()
  check() {
    return { status: "ok" };
  }
}

@Module({
  imports: [
    EnvModule,
    TransactionsModule,
    LecturesModule,
    AuthModule,
    TimetableModule,
    ReviewsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
