export class LectureDeleteEvent {
  static readonly topic = "lecture.deleted";

  constructor(readonly lectureId: number) {}
}
