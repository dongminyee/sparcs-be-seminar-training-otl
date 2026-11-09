# 06 · 시간표 담기·빼기와 충돌 검사

[TimetableController](../../apps/api/src/timetable/presentation/timetable.controller.ts)는 Guard로 사용자 ID를 얻고 경로에서 강의 ID를 읽습니다. [TimetableRepository](../../apps/api/src/timetable/repository/timetable.repository.ts)는 03에서 준비했습니다. 이번에는 [TimetableService](../../apps/api/src/timetable/service/timetable.service.ts)의 두 TODO를 채웁니다.

## 06a · 담기

`addIfAvailable(userId, lectureId, db)`에서 아래 순서로 판단합니다. Repository 호출에 같은 `db`를 전달하세요. 바깥의 `addTimetableLecture()`가 한 사용자에 대한 담기 요청을 순서대로 처리할 수 있도록 준비되어 있습니다.

1. `lectures.findActive(lectureId, db)`로 강의를 찾습니다. 없으면 `404`입니다.
2. `timetable.findByUser(userId, db)`로 현재 시간표를 조회합니다. 이미 같은 강의를 담았다면 그대로 끝냅니다.
3. 같은 연도·학기의 다른 강의와 비교합니다. 같은 요일에 `a.begin < b.end && b.begin < a.end`이면 두 수업이 겹칩니다. 겹친 강의를 찾아 제공된 `TimetableConflictException`으로 넘기세요.
4. 충돌이 없다면 `timetable.add(userId, lectureId, db)`로 저장합니다.

```sh
curl -i -X POST http://127.0.0.1:3001/api/timetable/lectures/1001 -H "Authorization: Bearer $TOKEN"
curl -i -X POST http://127.0.0.1:3001/api/timetable/lectures/1006 -H "Authorization: Bearer $TOKEN"
curl -i -X POST http://127.0.0.1:3001/api/timetable/lectures/1007 -H "Authorization: Bearer $TOKEN"
```

- 1001은 `204`입니다. 같은 요청을 한 번 더 보내도 시간표에는 한 건입니다.
- 1006은 1001과 월요일 수업시간이 겹쳐 `409 TIMETABLE_CONFLICT`입니다. 충돌 상대 ID는 1001입니다.
- 1007은 수요일에 1001이 끝나는 시각에 시작하므로 `204`입니다.
- 이 강의들은 초기 DB에 들어 있으므로 보조 서버를 꺼도 확인할 수 있습니다.

## 06b · 빼기

`removeLecture(userId, lectureId)`에서 `timetable.remove()`를 호출합니다. 조건에 두 ID가 모두 전달되어야 다른 사람의 시간표가 유지됩니다.

```sh
curl -i -X DELETE http://127.0.0.1:3001/api/timetable/lectures/1001 -H "Authorization: Bearer $TOKEN"
curl -i http://127.0.0.1:3001/api/timetable -H "Authorization: Bearer $TOKEN"
```

빼기 응답은 `204`이고, 조회 결과에서 1001만 빠져야 합니다. 이제 1006을 담으면 성공합니다.

[전체 실습 순서](../../README.md#실습-순서)
