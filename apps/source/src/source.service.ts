import { Injectable } from "@nestjs/common";
import { lectureFeed, retireLectureId } from "./lecture-feed";

@Injectable()
export class SourceService {
  private readonly startedAt = Date.now();
  private retired = false;

  getLectures() {
    return lectureFeed.filter(
      ({ id }) => !this.retired || id !== retireLectureId,
    );
  }

  async requestLectureDeletion() {
    const graceMs = Number(process.env.SOURCE_DELETE_AFTER_MS ?? 90_000);
    if (Date.now() - this.startedAt < graceMs) return;

    const apiUrl = process.env.API_URL ?? "http://127.0.0.1:3001";
    const response = await fetch(`${apiUrl}/api/lectures/${retireLectureId}`, {
      method: "DELETE",
      headers: { "x-source-key": process.env.SOURCE_API_KEY ?? "" },
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
