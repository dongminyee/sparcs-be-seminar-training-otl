# 04 · Cron으로 개설강의 동기화

보조 서버의 강의 피드를 10초마다 읽어서 개설강의 목록에 반영합니다. 피드 호출, 응답 검증, 강의와 수업시간을 저장하는 쿼리는 [LectureSyncRepository](../../apps/api/src/lectures/repository/lecture-sync.repository.ts)에 제공됩니다.

## 04a · 한 번 동기화하는 Service

[LectureSyncService.sync()](../../apps/api/src/lectures/service/lecture-sync.service.ts)를 채웁니다. `fetchLectures()`가 반환한 배열을 돌면서 각 강의마다 `saveLecture(lecture)`가 끝날 때까지 기다립니다. Repository는 같은 ID가 다시 들어오면 강의와 수업시간을 갱신합니다.

## 04b · 10초마다 실행하는 Scheduler

[LectureSyncScheduler](../../apps/api/src/lectures/presentation/lecture-sync.scheduler.ts)에 메서드를 하나 추가합니다. `@Cron("*/10 * * * * *", { waitForCompletion: true })`를 붙이고 Service의 `sync()`를 호출하세요. 여섯 칸 중 첫 칸은 초입니다. 모듈 등록은 되어 있습니다.

## 확인하기

`pnpm dev`가 실행 중인 상태에서 별도 터미널로 보조 서버를 켭니다.

```sh
pnpm dev:source
```

```sh
curl -fsS http://127.0.0.1:3002/api/lectures
curl -fsS http://127.0.0.1:3001/api/lectures
curl -fsS http://127.0.0.1:3001/api/timetable -H "Authorization: Bearer $TOKEN"
```

- 첫 요청에서 보조 서버의 강의 2001–2004를 확인합니다. 동기화 한 주기 뒤에는 두 번째 요청에도 같은 ID가 나타납니다.
- 다음 주기에도 개설강의 목록에서 각 ID는 한 번만 나타납니다.
- 내 시간표에는 03에서 넣어 둔 강의만 남습니다. Cron은 개설강의를 반영하고 시간표 변경은 06의 API가 맡습니다.

[전체 실습 순서](../../README.md#실습-순서)
