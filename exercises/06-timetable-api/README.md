# 06 · 시간표 담기·빼기와 충돌 검사

이제 HTTP로 내 시간표를 바꿉니다. 시간표에 이미 담긴 강의와 수업시간이 겹치면 `409`를 돌려주고, 요청한 강의의 연결 행을 만들지 않습니다.

## 이번 실습의 입력과 결과

| 요청                             | Controller가 전달하는 값        | 결과                                                                         |
| -------------------------------- | ------------------------------- | ---------------------------------------------------------------------------- |
| `POST /timetable/lectures/:id`   | 토큰의 사용자 ID, URL의 강의 ID | 새로 담거나 이미 담은 강의면 `204`, 대상이 없으면 `404`, 시간이 겹치면 `409` |
| `DELETE /timetable/lectures/:id` | 같은 두 ID                      | 그 사용자의 연결 행을 빼고 `204`                                             |

[TimetableController](../../apps/api/src/timetable/presentation/timetable.controller.ts)에 라우트와 Guard가 등록되어 있습니다. [TimetableRepository](../../apps/api/src/timetable/repository/timetable.repository.ts)는 03의 준비 코드를 사용합니다. 이번에는 [TimetableService](../../apps/api/src/timetable/service/timetable.service.ts)의 06a와 06b만 채우면 됩니다. 아래 테스트의 강의는 초기 DB에 있으므로 보조 서버가 꺼져 있어도 진행할 수 있습니다.

## 06a · 겹치는 강의가 없을 때만 담기

`addTimetableLecture()`가 사용자별 쓰기를 조정하고 `addIfAvailable(userId, lectureId, db)`를 호출하는 부분은 제공됩니다. TODO 안의 조회와 추가에 같은 `db`를 전달하세요. 이미 준비된 바깥 코드가 서로 겹치는 두 담기 요청이 동시에 들어와도 한 사용자 시간표를 순서대로 확인하게 합니다.

1. `lectures.findActive(lectureId, db)`로 새로 담을 강의를 읽습니다. 강의가 없거나 삭제되었다면 `NotFoundException`을 던집니다.
2. `timetable.findByUser(userId, db)`로 현재 시간표를 읽습니다. 이미 같은 ID가 있으면 그대로 끝냅니다.
3. 현재 시간표에서 새 강의와 같은 **연도와 학기**에 속한 강의만 비교합니다. 두 강의에 수업시간이 여러 개라면 어느 한 쌍이라도 겹치는지 찾으세요.
4. 같은 요일이고 `a.begin < b.end && b.begin < a.end`이면 겹칩니다. 조건에 맞는 기존 강의를 [TimetableConflictException](../../apps/api/src/timetable/service/timetable-conflict.exception.ts)에 넘깁니다.
5. 충돌이 없으면 `timetable.add(userId, lectureId, db)`로 연결 행을 추가합니다.

### 연습 데이터로 비교하기

| 강의                   | 수업시간          | 1001을 담은 상태에서의 결과                  |
| ---------------------- | ----------------- | -------------------------------------------- |
| `1001` 자료구조        | 월·수 09:00–10:15 | 같은 강의가 한 건만 유지됩니다.              |
| `1006` 자료구조 실습   | 월 09:30–10:45    | 월요일에 실제로 겹쳐 `409`입니다.            |
| `1007` 자료구조 세미나 | 수 10:15–11:00    | 1001이 끝나는 시간에 시작하므로 `204`입니다. |

부등호에 등호를 포함하면 10:15처럼 경계가 같은 경우까지 겹침으로 처리됩니다. 경계 테스트를 함께 실행하는 이유입니다.

```sh
curl -i -X POST "$API/timetable/lectures/1001" -H "Authorization: Bearer $TOKEN"
curl -i -X POST "$API/timetable/lectures/1001" -H "Authorization: Bearer $TOKEN"
curl -i -X POST "$API/timetable/lectures/1006" -H "Authorization: Bearer $TOKEN"
curl -i -X POST "$API/timetable/lectures/1007" -H "Authorization: Bearer $TOKEN"
curl -i -X POST "$API/timetable/lectures/9999" -H "Authorization: Bearer $TOKEN"
```

상태는 순서대로 `204`, `204`, `409`, `204`, `404`입니다. `409` 본문에는 `code: "TIMETABLE_CONFLICT"`와 `conflictingLectureId: 1001`이 있어야 합니다. 시간표를 조회했을 때 1001과 1007은 있고 1006은 없어야 합니다.

```sh
curl -fsS "$API/timetable" -H "Authorization: Bearer $TOKEN" \
  | node -pe 'JSON.parse(require("node:fs").readFileSync(0, "utf8")).map(row => row.id)'
```

## 06b · 내 시간표에서만 빼기

`removeLecture(userId, lectureId)`에서 `timetable.remove()`에 두 ID를 그대로 전달합니다. 강의 ID만 사용하면 같은 강의를 담은 다른 사람까지 영향을 받을 수 있습니다.

두 계정에 1001을 담아 둔 상태에서 한 계정만 빼 보세요. 06a에서 `student`의 1001을 담아 두었다면 아래 순서로 진행할 수 있습니다.

```sh
curl -i -X POST "$API/timetable/lectures/1001" -H "Authorization: Bearer $STUDENT2_TOKEN"
curl -i -X DELETE "$API/timetable/lectures/1001" -H "Authorization: Bearer $TOKEN"
curl -fsS "$API/timetable" -H "Authorization: Bearer $TOKEN"
curl -fsS "$API/timetable" -H "Authorization: Bearer $STUDENT2_TOKEN"
```

두 변경 요청은 `204`입니다. `student`의 응답에서만 1001이 빠지고 `student2`의 응답에는 남습니다. 이제 `student`가 1006을 담으면 `204`가 돌아옵니다. 토큰 없이 담기나 빼기를 호출하면 `401`입니다.

## 막혔을 때

- 1006이 담긴다면 두 강의의 요일과 학기 조건, 겹침 식의 두 부등호를 확인하세요.
- 1007이 `409`이면 경계 시각에 `<`를 사용했는지 확인하세요.
- 같은 강의를 두 번 담았더니 오류가 나면 비교 전에 같은 강의 ID가 있는지 확인하세요.
- 앞선 시도 때문에 결과가 다르면 내 시간표를 먼저 조회하세요. 06b가 완료된 뒤에는 테스트에 사용한 강의만 DELETE로 빼고 다시 실행할 수 있습니다.

[이전 문제 · 05 삭제 이벤트](../05-lecture-delete-event/README.md) · [전체 실습 순서](../../README.md#실습-순서) · [다음 문제 · 07 리뷰](../07-reviews/README.md)
