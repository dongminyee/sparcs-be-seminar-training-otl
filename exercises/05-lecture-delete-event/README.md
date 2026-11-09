# 05 · 강의 삭제와 시간표 정리 이벤트

보조 서버가 `DELETE /api/lectures/:id`를 보내면 강의의 삭제 시각을 기록합니다. 시간표 쪽 EventHandler는 그 강의를 담은 모든 사용자의 연결 행을 지웁니다.

## 05a · 강의 Service에서 발행하기

[LecturesService.deleteLecture()](../../apps/api/src/lectures/service/lectures.service.ts)에서 `LectureRepository.markDeleted(id)`를 호출하세요. `false`는 없는 ID이므로 `NotFoundException`을 던집니다. 성공하면 제공된 [LectureDeleteEvent](../../apps/api/src/lectures/events/lecture-delete.event.ts)를 만들어 `events.emitAsync(LectureDeleteEvent.topic, event)`가 끝날 때까지 기다립니다.

같은 ID로 다시 호출해도 Repository는 성공을 반환합니다. 삭제된 강의의 시간표 정리를 다시 시도할 수 있고, 이미 정리한 행을 지우는 요청은 그대로 완료됩니다.

## 05b · 시간표 Handler에서 받기

[LectureDeleteHandler](../../apps/api/src/timetable/presentation/lecture-delete.handler.ts)에 메서드를 추가합니다. `@OnEvent(LectureDeleteEvent.topic, { suppressErrors: false })`를 붙이고 이벤트의 `lectureId`를 `TimetableService.removeDeletedLecture()`로 넘깁니다. 모듈 등록과 실제 삭제 쿼리는 제공됩니다.

## 확인하기

두 TODO를 채운 뒤, 03에서 담아 둔 강의 1005를 직접 삭제합니다. 먼저 아래 쿼리로 연결 행이 있는지 확인하세요. 행이 없다면 03의 INSERT를 한 번 더 실행합니다.

```sh
docker compose exec -T mysql sh -c 'exec mysql -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' <<'SQL'
SELECT userId, lectureId FROM TimetableLecture WHERE lectureId = 1005;
SQL

curl -i -X DELETE http://127.0.0.1:3001/api/lectures/1005
curl -i -X DELETE http://127.0.0.1:3001/api/lectures/9999
```

첫 응답은 `204`, 없는 강의는 `404`입니다. 강의 목록과 내 시간표에서 1005가 사라집니다. 같은 SELECT를 다시 실행해 시간표 연결 행도 없어졌는지 확인합니다. 조회 쿼리는 삭제된 강의를 숨기므로, API 응답만 보면 연결 행이 실제로 지워졌는지 구분할 수 없습니다.

보조 서버의 자동 요청도 확인하려면 04에서 켜 둔 보조 서버를 종료하고 다음 명령으로 다시 켭니다.

```sh
SOURCE_DELETE_ENABLED=1 pnpm dev:source
```

기동 후 최소 90초가 지나면 보조 서버가 다음 30초 주기에 강의 2001의 삭제를 요청합니다. 삭제가 완료되면 개설강의 목록에서 2001이 사라지고 2002는 유지됩니다.

[전체 실습 순서](../../README.md#실습-순서)
