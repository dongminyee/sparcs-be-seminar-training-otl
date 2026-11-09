import { Controller, Get, Module } from '@nestjs/common';
import { LecturesModule } from './lectures/lectures.module';
import { AuthModule } from './auth/auth.module';
import { TimetableModule } from './timetable/timetable.module';

@Controller('health')
class HealthController {
  @Get()
  check() {
    return { status: 'ok' };
  }
}

@Module({
  imports: [LecturesModule, AuthModule, TimetableModule],
  controllers: [HealthController],
})
export class AppModule {}
