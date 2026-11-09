import { Module } from "@nestjs/common";
import { LecturesController } from "./presentation/lectures.controller";

@Module({ controllers: [LecturesController] })
export class LecturesModule {}
