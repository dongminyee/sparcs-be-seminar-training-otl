import { ConfigService } from "@mini-otl/env";
import { Injectable } from "@nestjs/common";
import { lectureFeed, retireLectureId } from "./lecture-feed";

@Injectable()
export class SourceService {
  private readonly startedAt = Date.now();
  private retired = false;

  constructor(private readonly config: ConfigService) {}

  getLectures() {
    return lectureFeed.filter(
      ({ id }) => !this.retired || id !== retireLectureId,
    );
  }

  async requestLectureDeletion() {
    const graceMs = Number(
      this.config.getOrThrow<string>("SOURCE_DELETE_AFTER_MS"),
    );
    if (Date.now() - this.startedAt < graceMs) return;

    const apiUrl = this.config.getOrThrow<string>("API_URL");
    const response = await fetch(`${apiUrl}/api/lectures/${retireLectureId}`, {
      method: "DELETE",
      headers: {
        "x-source-key": this.config.getOrThrow<string>("SOURCE_API_KEY"),
      },
      signal: AbortSignal.timeout(3000),
    });

    if (!response.ok) {
      throw new Error(
        `DELETE lecture ${retireLectureId}: HTTP ${response.status}`,
      );
    }
    const firstSuccess = !this.retired;
    this.retired = true;
    return firstSuccess ? retireLectureId : undefined;
  }
}
