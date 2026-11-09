import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/presentation/jwt-auth.guard";
import type { AuthenticatedUser } from "../../auth/presentation/jwt.strategy";
import { ResourceIdPipe } from "../../common/resource-id.pipe";
import { TimetableService } from "../service/timetable.service";

type AuthenticatedRequest = { user: AuthenticatedUser };

@Controller("timetable")
@UseGuards(JwtAuthGuard)
export class TimetableController {
  constructor(private readonly timetable: TimetableService) {}

  @Get()
  findMine(@Req() { user }: AuthenticatedRequest) {
    return this.timetable.findMine(user.id);
  }

  @Post("lectures/:id")
  @HttpCode(204)
  addLecture(
    @Req() { user }: AuthenticatedRequest,
    @Param("id", ResourceIdPipe) id: number,
  ) {
    return this.timetable.addTimetableLecture(user.id, id);
  }

  @Delete("lectures/:id")
  @HttpCode(204)
  removeLecture(
    @Req() { user }: AuthenticatedRequest,
    @Param("id", ResourceIdPipe) id: number,
  ) {
    return this.timetable.removeLecture(user.id, id);
  }
}
