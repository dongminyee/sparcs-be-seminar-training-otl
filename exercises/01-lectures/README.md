# 01 · 개설강의 조회

**완료 기준**은 인증 헤더 없이 `GET /api/lectures`를 호출했을 때 강의 목록과 각 강의의 수업시간이 나오는 것입니다. 같은 라우트를 세 번 발전시키면서 어느 코드가 HTTP를 담당하고 어느 코드가 DB에 접근하는지 살펴봅니다.

## 시작하기

`pnpm dev`를 켜고, 요청을 보낼 터미널을 따로 엽니다. 아직 라우트를 만들기 전이라면 두 요청의 결과가 다릅니다.

```sh
export API=http://127.0.0.1:3001/api
curl -i "$API/health"
curl -i "$API/lectures"
```

`/health`는 `200`, `/lectures`는 `404`입니다. 이 결과로 Nest는 실행 중이고 강의 조회 라우트만 아직 없다는 것을 확인할 수 있습니다.

| 파일                                                                                  | 이번 실습에서 하는 일                                                   |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [LecturesController](../../apps/api/src/lectures/presentation/lectures.controller.ts) | GET 메서드를 추가하고 01b에서 잠시 DB를 직접 읽습니다.                  |
| [LecturesService](../../apps/api/src/lectures/service/lectures.service.ts)            | 01c에서 강의 조회를 Repository로 전달합니다.                            |
| [LectureRepository](../../apps/api/src/lectures/repository/lecture.repository.ts)     | `lectureSelection`이 제공됩니다. 01c에서 목록 쿼리를 이곳으로 옮깁니다. |
| [LecturesModule](../../apps/api/src/lectures/lectures.module.ts)                      | 세 클래스와 `DatabaseModule`이 이미 등록되어 있습니다.                  |

## 01a · Nest에서 고정 응답 보내기

1. Controller 파일 상단에서 `@nestjs/common`의 `Get`을 가져옵니다.
2. `TODO(01a)` 자리에 메서드를 하나 추가하고 `@Get()`을 붙입니다. 메서드 이름은 `findAll`처럼 역할이 드러나게 정하세요.
3. 메서드에서 빈 배열 `[]`을 반환합니다. 저장 후 요청을 다시 보냅니다.

```sh
curl -i "$API/lectures"
```

기대 결과는 `200 OK`와 본문 `[]`입니다. `main.ts`의 전역 접두사 `api`, `@Controller("lectures")`, 메서드의 `@Get()`이 합쳐져 `GET /api/lectures`가 됩니다. 메서드 이름 자체는 URL에 들어가지 않습니다. 비슷한 코드가 궁금하면 [HealthController](../../apps/api/src/app.module.ts)를 읽어 보세요.

## 01b · 응답을 MySQL 데이터로 바꾸기

[PrismaService](../../apps/api/src/database/prisma.service.ts)를 Controller 생성자에 추가로 주입합니다. 생성자에 있는 `LecturesService`는 삭제 요청에도 쓰이므로 함께 둡니다. GET 메서드에서 빈 배열 대신 `prisma.lecture.findMany(...)`의 결과를 반환하세요. Nest는 조회 Promise가 완료되면 값을 JSON으로 응답합니다.

| 쿼리 옵션 | 이번 실습에서 하는 일                                                                |
| --------- | ------------------------------------------------------------------------------------ |
| `where`   | `deletedAt`이 `null`인 개설강의만 선택합니다. 05에서 이 값이 채워진 강의를 숨깁니다. |
| `select`  | 제공된 `lectureSelection`을 사용합니다. 강의 필드와 연결된 `classes`를 읽습니다.     |
| `orderBy` | 목록을 `code`, `classNo`, `id` 순으로 정렬합니다.                                    |

`Lecture`와 `ClassTime`의 관계는 [Prisma 스키마](../../apps/api/prisma/schema.prisma)에 있습니다. `classes`는 강의 한 건에 연결된 수업시간 배열입니다. `lectureSelection` 안에서는 이 배열을 요일과 시작 시각 순으로 정렬합니다. `day`는 월요일 0부터 금요일 4까지이고, `begin`과 `end`는 자정부터의 분입니다. 예를 들어 540은 오전 9시입니다.

```sh
curl -i "$API/lectures"
curl -fsS "$API/lectures" \
  | node -pe 'JSON.stringify(JSON.parse(require("node:fs").readFileSync(0, "utf8")).find(row => row.id === 1001), null, 2)'
```

두 번째 명령은 여러 강의 중 자료구조만 출력합니다. `id: 1001`, 제목 `자료구조`, 월·수 수업시간 두 건을 확인하세요. 이 시점부터 Next 화면의 목록에서도 강의가 보입니다.

## 01c · Controller, Service, Repository로 분리하기

변경 전 응답을 저장해 두면 이동 작업을 확인하기 쉽습니다. 같은 터미널에서 아래 명령을 실행해 두세요.

```sh
BEFORE_01=$(mktemp)
curl -fsS "$API/lectures" > "$BEFORE_01"
```

1. Controller에 있던 Prisma 쿼리를 `LectureRepository.findAllActive()`로 옮깁니다. 이 클래스에는 이미 `PrismaService`가 주입되어 있습니다.
2. `LecturesService.findAll()`을 만들고 `findAllActive()`의 결과를 반환합니다.
3. Controller의 GET 메서드는 Service의 `findAll()`을 호출합니다. 01b에서 Controller에 추가한 Prisma 주입과 관련 import를 정리하세요.
4. 모듈의 등록 상태를 읽어 보세요. Nest는 등록된 클래스를 찾아 Controller에 Service를, Service에 Repository를 전달합니다.

```sh
AFTER_01=$(mktemp)
curl -fsS "$API/lectures" > "$AFTER_01"
diff -u "$BEFORE_01" "$AFTER_01"
rm "$BEFORE_01" "$AFTER_01"
pnpm check
```

같은 DB 상태에서 비교하면 `diff`에 출력이 없습니다. 코드의 책임을 나눴고 HTTP 응답은 그대로입니다.

## 막혔을 때

- `/health`까지 연결되지 않으면 먼저 개발 서버와 포트 3001을 확인하세요.
- `/health`는 `200`인데 강의 조회가 `404`라면 `@Get()`을 붙였는지, 경로에 `/api`가 들어 있는지 확인하세요.
- `Nest can't resolve dependencies`가 보이면 생성자의 타입과 import, `LecturesModule`의 `imports`와 `providers`를 확인하세요.
- 목록은 오는데 수업시간이 빠지면 `lectureSelection`이 쿼리에 들어 있는지 확인하세요.
- 완료 후 GET 메서드부터 따라가며 **어디까지가 요청 처리이고, 어느 메서드에서 처음 DB를 읽는지** 설명해 보세요.

[전체 실습 순서](../../README.md#실습-순서) · [다음 문제 · 02 로그인](../02-login/README.md)
