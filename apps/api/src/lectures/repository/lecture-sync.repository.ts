import { lectureFeedSchema, type Lecture } from "@mini-otl/contracts";
import { ConfigService } from "@mini-otl/env";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class LectureSyncRepository {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async fetchLectures() {
    const sourceUrl = this.config.getOrThrow<string>("SOURCE_URL");
    const response = await fetch(`${sourceUrl}/api/lectures`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) {
      throw new Error(`Source returned HTTP ${response.status}`);
    }
    return lectureFeedSchema.parse(await response.json());
  }

  async saveLecture({ id, classes, ...fields }: Lecture) {
    await this.prisma.$transaction(async tx => {
      await tx.lecture.upsert({
        where: { id },
        create: { id, ...fields },
        update: fields,
      });
      await tx.classTime.deleteMany({ where: { lectureId: id } });
      if (classes.length) {
        await tx.classTime.createMany({
          data: classes.map(slot => ({ lectureId: id, ...slot })),
        });
      }
    });
  }
}
