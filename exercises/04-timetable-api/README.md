# 04 · 내 시간표 API와 수업시간 충돌

JWT로 확인한 사용자의 시간표를 조회하고 강의를 담거나 뺍니다. [시간표 컨트롤러](../../apps/api/src/timetable/presentation/timetable.controller.ts)의 세 스텁에서 시작하세요.

| 요청                                 | 성공            |
| ------------------------------------ | --------------- |
| `GET /api/timetable`                 | `200 Lecture[]` |
| `POST /api/timetable/lectures/:id`   | `204`           |
| `DELETE /api/timetable/lectures/:id` | `204`           |

## 구현 범위

- 세 API 모두 JWT Guard를 적용하고, 토큰에서 확인한 사용자 ID로만 시간표를 읽고 변경합니다.
- `TimetableService.addTimetableLecture`에서 강의 존재 여부, 중복, 수업시간 충돌을 검사합니다. 충돌은 같은 연도·학기·요일의 수업시간끼리 비교합니다.
- 시간 구간이 겹치면 `409 TIMETABLE_CONFLICT`를 반환하고 연결 행은 추가하지 않습니다. 한 수업의 종료 시각에 다른 수업이 시작하면 담을 수 있습니다.
- 충돌 검사와 강의 추가를 같은 `@Transactional()` 서비스 메서드에서 처리합니다.

## 완료 확인

02단계에서 받은 토큰을 `TOKEN`에 넣고 확인합니다.

```sh
curl -i -X POST http://127.0.0.1:3001/api/timetable/lectures/1001 \
  -H "Authorization: Bearer $TOKEN"
curl -i http://127.0.0.1:3001/api/timetable \
  -H "Authorization: Bearer $TOKEN"
```

- 토큰 없이 요청하면 `401`, 없는 강의를 담으면 `404`입니다.
- 자료구조를 두 번 담아도 시간표에는 한 건만 표시됩니다. 같은 경로를 `DELETE`로 호출하면 내 시간표에서 빠집니다.
- 06단계의 강의 피드를 동기화한 뒤 `2002`가 담긴 상태에서 `2003`을 직접 담으면 `409`와 충돌 상대 ID `2002`를 확인할 수 있습니다.

[전체 실습 순서](../../README.md#실습-순서)
