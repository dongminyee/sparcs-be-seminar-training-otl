# 04 · Cron으로 개설강의 동기화

이번에는 사람이 HTTP 요청을 보내지 않아도 Nest가 일정한 주기로 일을 합니다. 보조 서버가 제공하는 피드를 읽고 MySQL에 반영한 뒤, 01에서 만든 개설강의 API로 결과를 확인합니다.

## 시작하기

기존 터미널의 `pnpm dev`를 켜 둡니다. 터미널을 하나 더 열고 저장소 루트에서 보조 서버를 시작하세요.

```sh
pnpm dev:source
```

요청용 터미널에서 두 앱을 따로 확인합니다.

```sh
curl -i http://127.0.0.1:3002/api/lectures
curl -i "$API/lectures"
```

처음 보조 서버를 실행하면 3002의 피드에는 `2001`–`2004`가 있습니다. 이번 문제를 풀기 전 새 DB라면 3001의 개설강의 목록에는 이 네 ID가 없습니다. 두 요청이 각각 다른 Nest 앱을 향한다는 점을 확인하세요.

## 입력과 저장 코드 읽어 보기

| 위치                                                                                       | 제공되는 역할                                                                                             |
| ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| [보조 서버의 강의 피드](../../apps/source/src/lecture-feed.ts)                             | 강의 ID와 제목, 연도·학기, 수업시간 배열을 제공하는 예시 데이터입니다.                                    |
| [LectureSyncRepository](../../apps/api/src/lectures/repository/lecture-sync.repository.ts) | `fetchLectures()`가 피드를 읽고 형식을 확인합니다. `saveLecture(lecture)`는 강의와 수업시간을 저장합니다. |
| [LecturesModule](../../apps/api/src/lectures/lectures.module.ts)                           | Schedule 모듈과 Scheduler, Service, Repository를 등록합니다.                                              |

`saveLecture()`는 피드의 ID를 그대로 사용합니다. 같은 ID를 다시 받으면 해당 강의의 정보와 수업시간을 갱신합니다. 05에서 기록할 삭제 시각은 피드 갱신에 의해 지워지지 않습니다.

## 04a · 한 번 동기화하는 Service

[LectureSyncService.sync()](../../apps/api/src/lectures/service/lecture-sync.service.ts)의 TODO를 채웁니다.

1. `fetchLectures()`가 끝날 때까지 기다려 배열을 받습니다.
2. 배열을 순회하며 각 강의를 `saveLecture(lecture)`에 전달합니다. 다음 항목으로 넘어가기 전에 저장이 끝나도록 `await`를 사용합니다.
3. `sync()`의 역할은 개설강의와 수업시간 반영입니다. 내 시간표의 연결 행은 06에서 구현할 HTTP API로 변경합니다.

여기까지 작성하면 타입 검사를 할 수 있습니다. 자동 실행과 DB 반영은 Scheduler를 연결한 뒤 확인합니다.

```sh
pnpm --filter @mini-otl/api check
```

## 04b · 10초마다 실행하는 Scheduler

[LectureSyncScheduler](../../apps/api/src/lectures/presentation/lecture-sync.scheduler.ts)에 메서드를 추가하고 `@nestjs/schedule`에서 `Cron`을 가져옵니다.

- 메서드에 `@Cron("*/10 * * * * *", { waitForCompletion: true })`를 붙입니다.
- 여섯 칸의 Cron 표현식에서 첫 칸은 초입니다. 초가 0, 10, 20, 30, 40, 50일 때 실행합니다.
- Scheduler는 `LectureSyncService.sync()`를 호출하고 완료를 기다립니다. `waitForCompletion`은 이전 실행이 아직 진행 중이면 다음 실행을 건너뛰는 옵션입니다.

## 확인하기

한 주기 정도 기다린 뒤, 두 응답에서 가져온 ID를 각각 출력합니다.

```sh
curl -fsS http://127.0.0.1:3002/api/lectures \
  | node -pe 'JSON.parse(require("node:fs").readFileSync(0, "utf8")).map(row => row.id)'
curl -fsS "$API/lectures" \
  | node -pe 'JSON.parse(require("node:fs").readFileSync(0, "utf8")).map(row => row.id).filter(id => id >= 2000)'
curl -fsS "$API/timetable" -H "Authorization: Bearer $TOKEN"
```

- 두 목록에 `2001`–`2004`가 모두 나타납니다. 강의 목록의 정렬 규칙은 01에서 정했으므로 두 배열의 순서는 다를 수 있습니다.
- 다음 주기에도 각 ID는 한 번만 나타납니다.
- 내 시간표는 동기화 전과 같습니다. 03의 예시를 유지했다면 `1005`가 있고, 피드에서 새로 받은 네 강의는 들어가지 않습니다.

## 막혔을 때

- 3002에 연결할 수 없다면 `pnpm dev:source`가 켜져 있는지 확인하세요.
- 보조 서버는 응답하는데 3001의 강의가 늘지 않으면 Cron 데코레이터를 붙였는지, Scheduler가 `sync()`를 실제로 호출하는지 확인하세요. 필요하면 Scheduler 메서드에 잠시 로그를 넣어 10초마다 호출되는지 볼 수 있습니다.
- Scheduler가 돌지만 `fetch failed`가 찍히면 `.env`의 `SOURCE_URL`과 보조 서버의 포트가 일치하는지 확인하세요.
- 동기화 도중 DB 오류가 난다면 Nest 로그에서 어떤 저장이 실패했는지 읽고, Service가 저장 Promise를 기다리는지 확인하세요.

[이전 문제 · 03 내 시간표](../03-timetable-model/README.md) · [전체 실습 순서](../../README.md#실습-순서) · [다음 문제 · 05 삭제 이벤트](../05-lecture-delete-event/README.md)
