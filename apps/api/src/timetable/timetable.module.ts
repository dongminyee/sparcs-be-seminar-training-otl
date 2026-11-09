import { Module } from "@nestjs/common";
import { TimetableController } from "./presentation/timetable.controller";

@Module({ controllers: [TimetableController] })
export class TimetableModule {}
