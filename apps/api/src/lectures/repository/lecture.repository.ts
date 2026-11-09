import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";

export const lectureSelection = {
  id: true,
  code: true,
  classNo: true,
  title: true,
  titleEn: true,
  department: true,
  professor: true,
  credit: true,
  year: true,
  semester: true,
  classes: {
    orderBy: [{ day: "asc" }, { begin: "asc" }],
    select: { day: true, begin: true, end: true, room: true },
  },
} satisfies Prisma.LectureSelect;

@Injectable()
export class LectureRepository {
  constructor(private readonly prisma: PrismaService) {}

  findActiveAll(){
    return this.prisma.lecture.findMany({
      where: { deletedAt: null },
      select: lectureSelection,
    });
  }

  findActive(id: number, db: Prisma.TransactionClient = this.prisma) {
    return db.lecture.findUnique({
      where: { id, deletedAt: null },
      select: lectureSelection,
    });
  }

  async existsActive(id: number) {
    const lecture = await this.prisma.lecture.findUnique({
      where: { id, deletedAt: null },
      select: { id: true },
    });
    return lecture !== null;
  }

  async markDeleted(id: number) {
    const { count } = await this.prisma.lecture.updateMany({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    if (count > 0) return true;
    // An already retired lecture can publish its cleanup event again.
    return (await this.prisma.lecture.count({ where: { id } })) > 0;
  }
}
