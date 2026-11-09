# Mini OTL

`sparcs-be-seminar-training-otl`은 SPARCS 세미나에서 NestJS, Prisma(MySQL), 3계층 아키텍처를 실습하는 시간표 앱입니다. GitHub에 올라온 저장소를 포크한 뒤 `main`에서 실습을 시작하고, 각 단계의 정답은 `answer` 커밋으로 확인합니다. 포크할 때 두 브랜치를 모두 가져오려면 **Copy the main branch only**를 해제하세요.

## 실행

Node.js 22.12 이상, pnpm 10, Docker Compose가 필요합니다. Docker를 실행한 뒤 저장소 루트에서 실행하세요.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

| 구성 | 로컬 주소 | 역할 |
| --- | --- | --- |
| Next.js | http://127.0.0.1:3000 | 강의 검색, 로그인, 시간표 및 Nest API 프록시 |
| 실습용 NestJS | http://127.0.0.1:3001/api/health | 실습 API, 강의 동기화, 삭제 이벤트 |
| 보조 NestJS | http://127.0.0.1:3002/api/lectures | 동기화할 강의 피드 및 주기적인 삭제 요청 |
| MySQL 8.4 | 127.0.0.1:13306 | 초기 계정과 강의 및 실습 데이터 |

`pnpm dev`는 MySQL이 준비되면 현재 브랜치의 마이그레이션을 적용하고 Prisma Client를 생성한 뒤 앱 3개를 시작합니다. `.env`와 초기값은 로컬 실습용으로 저장소에 포함됩니다. 로그인 계정은 **`student` / `mini-otl-2026`**이며, 초기 마이그레이션에 bcrypt 해시가 들어 있습니다. 새로고침하면 화면의 로그인 세션이 종료됩니다.

`main`의 미구현 API는 `501`을 반환합니다. Next 화면은 각각의 요청 상태를 독립적으로 표시합니다. 브라우저는 Next의 같은 출처 API를 호출하고, Next는 실습용 Nest에만 연결합니다. Nest에 연결할 수 없으면 해당 요청은 `503`, Nest 내부 오류는 `502`로 표시됩니다.

`Ctrl+C`로 앱을 종료하고 `pnpm db:down`으로 MySQL을 중지합니다. 정답에서 실습을 다시 시작하거나 Cron 시연을 처음부터 반복할 때는 앱을 종료한 뒤 `docker compose down -v`로 **이 프로젝트의 실습 DB 데이터를 삭제**하고 `pnpm dev`를 실행하세요.

## 실습 순서

`apps/api/src`에서 기능별 모듈을 사용합니다. Presentation(Controller / Scheduler / EventHandler)은 요청과 트리거를 받고, Service는 유스케이스를 처리하고, Repository는 Prisma로 DB에 접근합니다. `apps/source`와 `apps/web`는 준비된 상태입니다.

1. **개설강의 조회** — `Lecture`와 `ClassTime`을 읽어서 강의 및 수업시간을 반환합니다. 비로그인 사용자가 조회할 수 있어야 합니다.
2. **로그인** — 초기 계정을 DB에서 찾아 비밀번호를 비교하고 JWT를 발급합니다. Passport JWT Strategy와 Guard를 준비합니다.
3. **시간표 테이블** — `User`와 `Lecture`를 연결하는 명시적인 다대다 모델을 작성합니다. 사용자와 강의 조합을 복합 기본 키로 두고 `pnpm db:migrate --name add_timetable`로 마이그레이션을 만듭니다. 이 명령은 MySQL 컨테이너가 실행 중일 때 사용합니다.
4. **시간표 API** — Guard로 검증한 토큰에서 사용자 ID를 얻어 조회, 담기, 빼기를 구현합니다. 담기는 `TimetableService.addTimetableLecture`에서 검증합니다. 같은 강의를 여러 번 담아도 한 건만 남고, 같은 학기의 기존 강의와 수업시간이 겹치면 `409`를 반환합니다. 수업 종료와 시작이 맞닿는 경우에는 담을 수 있습니다.
5. **Cron 동기화** — 기본 10초마다 보조 Nest의 피드를 읽어 개설강의를 반영하고 처음 들어온 강의를 같은 서비스로 실습 계정 시간표에 담습니다. 충돌한 강의는 개설강의에 남고, 시간표에는 추가되지 않습니다. Cron은 충돌을 로그로 남기고 다음 강의를 처리합니다. 반복 동기화는 사용자가 뺀 강의를 다시 담지 않습니다.
6. **강의 삭제 이벤트** — 강의를 삭제 상태로 바꾸고 `LectureDeleteEvent`를 발행합니다. 시간표 행 삭제는 EventHandler가 호출하는 시간표 로직에서 수행합니다. 보조 Nest는 기동 후 최소 90초가 지나면 30초마다 `2001`의 삭제를 요청합니다. 강의 `2002`는 계속 남습니다.

빈 DB에서 답안을 실행하면 `2002` 프로그래밍 언어가 자동으로 담기고, 시간이 겹치는 `2003` 알고리즘 설계와 `2004` 응용확률론은 개설강의 목록에만 표시됩니다. 로그인 후 두 강의 중 하나를 직접 담으면 충돌 메시지를 확인할 수 있습니다.

`git log --reverse --oneline main..answer`로 단계별 커밋을 확인할 수 있습니다. 답안에서는 강의의 삭제 시각을 DB에 남겨 보조 서버 재시작이나 이전 피드의 재전송으로 삭제된 강의가 다시 나타나는 것을 막습니다.

## API 계약

아래 경로는 실습 Nest 기준입니다. 브라우저용 경로도 같으며, 강의 자체 삭제는 보조 Nest에서 실습 Nest로 직접 호출합니다.

| 메서드 | 경로 | 입력 | 성공 |
| --- | --- | --- | --- |
| GET | `/api/lectures` | 공개 | `200 Lecture[]` |
| POST | `/api/auth/login` | JSON `{ "username": "student", "password": "mini-otl-2026" }` | `200 { accessToken, user }` |
| GET | `/api/timetable` | `Authorization: Bearer <token>` | `200 Lecture[]` |
| POST | `/api/timetable/lectures/:id` | Bearer 토큰 | `204` |
| DELETE | `/api/timetable/lectures/:id` | Bearer 토큰 | `204` |
| DELETE | `/api/lectures/:id` | `x-source-key`에 `.env`의 `SOURCE_API_KEY` | `204` |

잘못된 로그인이나 인증은 `401`, 유효하지 않은 입력은 `400`, 담기 또는 강의 자체 삭제에서 대상이 없으면 `404`를 반환합니다. 같은 학기의 다른 강의와 시간이 겹치면 담기 API는 `409 TIMETABLE_CONFLICT`와 충돌 상대 강의 ID를 반환합니다. 응답 타입과 강의 피드 스키마는 `packages/contracts`에 있습니다. 수업시간의 `day`는 월요일 0부터 금요일 4까지이며 `begin`, `end`는 자정부터 분 단위입니다.

## 참고 코드

- [newbie-seminar-otl](https://github.com/Gerbera3090/newbie-seminar-otl)의 로컬 MySQL 실습 구성
- [OTL Plus Web v4](https://github.com/sparcs-kaist/otlplus-web-v4/tree/3d08b15)의 강의 목록·시간표 레이아웃 및 분 단위 수업시간 형식
- [OTL Plus Nest 서버](https://github.com/sparcs-kaist/otlplus-server/tree/d1f7b9e)의 강의·수업시간·시간표 관계와 기능별 API 구성
