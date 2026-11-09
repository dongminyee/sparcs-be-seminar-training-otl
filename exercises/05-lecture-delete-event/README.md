# 05 · 강의 삭제와 시간표 정리 이벤트

강의가 폐지되면 개설강의 목록에서 숨기고, 그 강의를 담은 모든 사용자 시간표에서 연결 행을 지웁니다. 강의 기능에서 삭제 사실을 알리고, 시간표 기능에서 그 알림을 받아 자기 데이터를 정리합니다.

## 전체 흐름

```text
보조 서버 또는 curl → DELETE /api/lectures/:id → LecturesController
  → LecturesService → LectureRepository.markDeleted(id)
  → LectureDeleteEvent(id) 발행
  → LectureDeleteHandler → TimetableService.removeDeletedLecture(id)
  → TimetableRepository가 해당 강의의 연결 행을 모두 삭제
```

이 이벤트는 실습용 Nest 프로세스 안에서 전달됩니다. 보조 서버와 실습용 Nest 사이는 HTTP DELETE이고, 이벤트는 HTTP 요청을 받은 실습용 Nest 안에서 발행합니다.

| 파일                                                                                        | 하는 일                                                                    |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [LecturesService](../../apps/api/src/lectures/service/lectures.service.ts)                  | 05a에서 삭제를 기록하고 이벤트를 발행합니다.                               |
| [LectureDeleteEvent](../../apps/api/src/lectures/events/lecture-delete.event.ts)            | 이벤트 주제 `topic`과 전달할 `lectureId`를 정의합니다.                     |
| [LectureDeleteHandler](../../apps/api/src/timetable/presentation/lecture-delete.handler.ts) | 05b에서 이벤트를 구독하고 시간표 Service를 호출합니다.                     |
| [LectureRepository](../../apps/api/src/lectures/repository/lecture.repository.ts)           | `markDeleted(id)`가 DB의 `deletedAt`을 채우고 대상이 있었는지 알려 줍니다. |

## 05a · 강의 Service에서 삭제 알리기

1. `deleteLecture(id)`에서 `LectureRepository.markDeleted(id)`를 호출합니다. 반환값이 `false`이면 존재하지 않는 강의이므로 `NotFoundException`을 던집니다.
2. 성공이면 `new LectureDeleteEvent(id)`를 만들고 `events.emitAsync()`에 이벤트 주제와 객체를 전달합니다. 핸들러 작업이 끝난 뒤 HTTP 요청이 완료되도록 `await`를 사용하세요.
3. 이미 삭제된 강의에 대해 `markDeleted()`는 다시 성공을 반환합니다. 같은 DELETE를 보내면 시간표 정리도 다시 시도할 수 있습니다.

`Lecture` 행에는 삭제 시각이 남습니다. 01의 공개 조회와 03의 내 시간표 조회는 이 시각이 설정된 강의를 숨깁니다. 04의 피드를 나중에 다시 받아도 이 시각은 유지됩니다.

## 05b · 시간표 Handler에서 이벤트 받기

1. `LectureDeleteHandler`에 메서드를 추가합니다. `@nestjs/event-emitter`의 `OnEvent`를 가져옵니다.
2. 메서드에 `@OnEvent(LectureDeleteEvent.topic, { suppressErrors: false })`를 붙입니다. 발행할 때와 구독할 때 같은 `topic`을 사용하세요. 이 옵션은 핸들러 오류를 발행한 쪽으로 전달합니다.
3. 이벤트에서 `lectureId`를 읽어 `TimetableService.removeDeletedLecture(lectureId)`를 호출하고 완료를 기다립니다. Service와 Repository의 삭제 쿼리는 03에서 준비했습니다.

## 확인 1 · curl로 삭제 전후 DB 행 비교하기

03의 [DB 확인 함수](../../README.md#mysql과-마이그레이션)가 등록된 요청 터미널에서 실행합니다. 처음 확인할 때는 삭제 전인 `1005`를 사용하세요.

```sh
db_sql <<'SQL'
INSERT IGNORE INTO TimetableLecture (userId, lectureId)
SELECT id, 1005 FROM User WHERE username IN ('student', 'student2');
SELECT userId, lectureId FROM TimetableLecture WHERE lectureId = 1005 ORDER BY userId;
SQL
```

`(1, 1005)`와 `(2, 1005)`를 확인한 뒤 다음 요청을 보냅니다.

```sh
curl -i -X DELETE "$API/lectures/1005"
curl -i -X DELETE "$API/lectures/1005"
curl -i -X DELETE "$API/lectures/9999"

db_sql <<'SQL'
SELECT id, deletedAt FROM Lecture WHERE id = 1005;
SELECT userId, lectureId FROM TimetableLecture WHERE lectureId = 1005;
SQL
```

- 처음과 두 번째 요청은 `204`, 없는 강의는 `404`입니다.
- `Lecture`의 1005 행은 남고 `deletedAt`에 시각이 표시됩니다.
- `TimetableLecture` 조회는 0행이어야 합니다. 강의 API와 내 시간표도 1005를 보여주지 않습니다.
- 시간표 API는 삭제 시각을 보고 이미 숨길 수 있습니다. **이벤트가 DB 행까지 정리했는지는 SQL 조회로 확인하세요.**

## 확인 2 · 보조 서버의 예약 DELETE 보내기

04에서 피드를 동기화했고 `2001`이 개설강의에 보이는 상태에서 진행합니다. 먼저 두 사용자의 시간표에 연결 행을 넣습니다.

```sh
db_sql <<'SQL'
INSERT IGNORE INTO TimetableLecture (userId, lectureId)
SELECT id, 2001 FROM User WHERE username IN ('student', 'student2');
SELECT userId, lectureId FROM TimetableLecture WHERE lectureId = 2001;
SQL
```

04에서 켜 둔 보조 서버 터미널에서 `Ctrl+C`를 누르고, 같은 터미널에서 예약 삭제를 켜 다시 실행합니다.

```sh
SOURCE_DELETE_ENABLED=1 pnpm dev:source
```

기동 후 **최소 90초**가 지나면 다음 30초 주기에 2001의 DELETE를 요청합니다. 보조 서버 터미널에서 삭제 완료 로그를 본 뒤 아래를 확인하세요.

```sh
curl -fsS "$API/lectures" \
  | node -pe 'JSON.parse(require("node:fs").readFileSync(0, "utf8")).map(row => row.id).filter(id => id >= 2000)'
db_sql <<'SQL'
SELECT COUNT(*) AS timetable_rows FROM TimetableLecture WHERE lectureId = 2001;
SQL
```

목록에 2001이 없고 2002–2004는 남습니다. `timetable_rows`는 0입니다.

## 막혔을 때

- `204`가 오고 화면에서만 사라졌다면 `@OnEvent`의 주제와 발행 주제가 일치하는지, 핸들러가 시간표 삭제 Service를 호출하는지 확인하세요.
- 직접 DELETE는 동작하는데 예약 요청이 없다면 보조 서버에 `SOURCE_DELETE_ENABLED=1`이 전달되었는지, 기동 후 90초가 지났는지 확인하세요.
- 검증을 다시 하려면 아직 삭제되지 않은 테스트 강의나 별도 실습 DB를 사용하세요. 앱 재시작만으로 DB의 삭제 시각이 초기화되지는 않습니다.

[이전 문제 · 04 동기화](../04-lecture-sync/README.md) · [전체 실습 순서](../../README.md#실습-순서) · [다음 문제 · 06 시간표 담기](../06-timetable-api/README.md)
