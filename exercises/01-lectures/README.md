# 01 · 개설강의 조회

로그인 없이 `GET /api/lectures`를 호출할 수 있게 합니다. 한 라우트를 세 번 바꾸면서 HTTP 응답부터 DB 조회와 계층 분리까지 차례로 확인하세요.

## 01a · Nest에서 응답하기

[LecturesController](../../apps/api/src/lectures/presentation/lectures.controller.ts)에 메서드를 추가하고 `@Get()`을 붙입니다. 우선 빈 배열을 반환하세요. `@Controller("lectures")`가 컨트롤러의 경로를 정하고, `main.ts`가 모든 API 앞에 `/api`를 붙입니다. 다른 예시가 필요하면 [HealthController](../../apps/api/src/app.module.ts)를 보세요.

```sh
curl -i http://127.0.0.1:3001/api/lectures
```

응답은 `200`과 `[]`입니다.

## 01b · MySQL에서 읽기

Controller 생성자에 [PrismaService](../../apps/api/src/database/prisma.service.ts)를 주입하고, 고정 응답을 `prisma.lecture.findMany(...)`로 바꿉니다. `DatabaseModule`은 이미 `LecturesModule`에 등록되어 있습니다.

- `where`로 `deletedAt`이 `null`인 강의만 조회합니다.
- `select`에는 제공된 [lectureSelection](../../apps/api/src/lectures/repository/lecture.repository.ts)을 사용합니다. 연결된 `classes`도 읽고, 요일과 시작 시각 순으로 정렬하는 부분을 확인하세요.
- 강의 목록은 `code`, `classNo`, `id` 순으로 정렬합니다. 수업시간에서 `day`는 월요일 0부터 금요일 4까지이고, `begin`과 `end`는 자정 기준 분 단위입니다.

같은 요청에서 자료구조(1001)와 월·수 수업시간이 보여야 합니다. 이 시점부터 Next 화면에서도 목록을 확인할 수 있습니다.

## 01c · 3계층으로 나누기

1. 조회 코드를 [LectureRepository](../../apps/api/src/lectures/repository/lecture.repository.ts)의 `findAllActive()`로 옮깁니다.
2. [LecturesService](../../apps/api/src/lectures/service/lectures.service.ts)의 `findAll()`에서 Repository 메서드를 호출합니다.
3. Controller의 GET 메서드가 Service를 호출하게 하고, 01b에서 Controller에 추가한 Prisma 주입을 제거합니다.

같은 요청을 한 번 더 보내세요. 01b에서 확인한 응답이 유지되어야 합니다. `pnpm check`로 타입을 확인합니다.

[전체 실습 순서](../../README.md#실습-순서)
