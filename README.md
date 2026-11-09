# Mini OTL 백엔드 실습

SPARCS 신입 세미나에서 작은 시간표 서비스의 백엔드를 만듭니다. 첫 요청은 NestJS에서 빈 배열을 반환하는 것부터 시작합니다. 이후 같은 API를 MySQL과 연결하고, 로그인한 사용자의 시간표를 관리하고, 강의 삭제 이벤트와 리뷰 하트를 처리합니다.

TypeScript에서 함수와 객체를 읽을 수 있으면 시작할 수 있습니다. NestJS, Prisma, JWT, SQL 명령은 처음 접해도 따라올 수 있도록 각 문제에 파일 위치, 작업 순서, 확인 명령을 적었습니다.

## 어떤 브랜치로 시작하나요?

| 브랜치          | 용도                                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------------- |
| `main`          | 수강생용 시작점입니다. 모듈 설정, 화면, 초기 데이터, 대부분의 Controller와 Repository가 준비되어 있습니다.    |
| `guided-answer` | `main`의 TODO를 실습 순서대로 푼 답안입니다. `01a`부터 `08b`까지 18개 커밋을 개별로 열어볼 수 있습니다.       |
| `answer`        | 이전 버전의 완성본을 보관한 브랜치입니다. 아래 실습과 답안 비교는 `main`과 `guided-answer`를 기준으로 합니다. |

직접 수정할 브랜치를 하나 만드세요. 조직 저장소에 쓰기 권한이 없어도 로컬 브랜치에서 실습할 수 있습니다.

```sh
git clone https://github.com/sparcs-kaist/sparcs-be-seminar-training-otl.git
cd sparcs-be-seminar-training-otl
git switch -c my-seminar origin/main
```

개인 포크로 시작하는 경우에는 위 주소 대신 포크한 저장소의 주소를 사용하세요. 포크 화면에서 **Copy the main branch only**를 해제하면 답안 브랜치도 복사됩니다. 이미 `main`만 복사했다면 아래 [답안 보는 법](#답안-보는-법)에서 원본의 답안 브랜치만 가져올 수 있습니다.

## 처음 실행하기

### 1. 도구 확인

저장소 루트에서 실행하세요. 루트에는 `package.json`과 `compose.yaml`이 같이 있습니다.

```sh
node --version
pnpm --version
docker compose version
docker info
```

- Node.js는 **22.12 이상**, pnpm은 **10**이 필요합니다. 저장소는 pnpm **10.32.1**을 사용합니다. pnpm이 없으면 `npm install --global pnpm@10.32.1`로 설치할 수 있습니다.
- Docker Compose는 `docker compose` 명령으로 실행합니다. `docker info`가 Docker 서버에 연결하지 못하면 Docker Desktop 또는 Docker 데몬을 먼저 시작하세요.
- 아래 요청 예시는 Bash와 Zsh 기준입니다. Windows에서는 WSL 터미널에서 같은 명령을 실행할 수 있습니다.

### 2. 의존성 설치와 개발 서버 실행

```sh
pnpm install --frozen-lockfile
pnpm dev
```

`pnpm dev`는 아래 순서대로 실행합니다. 앱이 뜨기 전까지는 몇 초 정도 걸릴 수 있고, 처음에는 MySQL 이미지도 받아야 합니다.

1. Docker에서 MySQL을 시작하고 접속 가능해질 때까지 기다립니다.
2. `apps/api/prisma/migrations`의 기존 마이그레이션을 DB에 적용합니다. 이 과정에서 실습 계정과 강의가 만들어집니다.
3. `schema.prisma`에 맞춰 TypeScript용 Prisma Client를 생성합니다.
4. Nest API와 Next 화면을 켭니다. 소스 파일을 저장하면 개발 서버가 변경을 반영합니다.

| 주소                                 | 하는 일                             | 언제 쓰나요?                                         |
| ------------------------------------ | ----------------------------------- | ---------------------------------------------------- |
| `http://127.0.0.1:3001/api`          | 학생이 만드는 Nest API              | 모든 단계에서 직접 요청합니다.                       |
| `http://127.0.0.1:3000`              | 제공된 Next 화면                    | API를 확인한 뒤 화면에서도 같은 동작을 볼 때 씁니다. |
| `http://127.0.0.1:3002/api/lectures` | 강의 피드를 제공하는 보조 Nest 서버 | 04에서 별도 터미널에 `pnpm dev:source`로 시작합니다. |
| `127.0.0.1:13306`                    | Docker의 MySQL                      | 03과 08에서 테이블과 데이터를 확인합니다.            |

### 3. 첫 요청 보내기

`pnpm dev`는 켜 둔 채 다른 터미널을 열고, 그 터미널에서도 저장소 루트로 이동하세요.

```sh
export API=http://127.0.0.1:3001/api
curl -i "$API/health"
curl -i "$API/lectures"
```

첫 번째 응답은 `200 OK`와 `{"status":"ok"}`입니다. 두 번째는 `main`에서 `404`입니다. 01a에서 강의 조회 라우트를 만들면 같은 명령이 `200`을 반환합니다. `-i`는 HTTP 상태 줄과 헤더를 본문 앞에 보여줍니다. 실습 문서의 `$API`는 이 터미널 변수입니다. 새 터미널을 열면 다시 설정하세요.

`main`에서 화면을 열면 아직 채우지 않은 기능에 오류가 표시될 수 있습니다. 먼저 위의 상태 확인 API를 확인하고, 각 문제의 요청을 Nest에 직접 보내세요. Next 프록시는 Nest 내부의 `500`을 브라우저에 `502`로 표시하므로, 원인을 찾을 때는 포트 3001의 응답과 Nest 터미널 로그를 같이 봅니다.

## 실습 순서

| 단계                                                               | 학생이 만드는 것                            | 제공되는 것                                   | 끝났는지 확인하는 방법                                                       |
| ------------------------------------------------------------------ | ------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------- |
| [01 개설강의 조회](exercises/01-lectures/README.md)                | 고정 응답, Prisma 조회, 3계층 분리          | DB 연결과 초기 강의, 응답 필드 선택 객체      | 토큰 없이 `GET /lectures`가 강의와 수업시간을 반환합니다.                    |
| [02 초기 계정 로그인](exercises/02-login/README.md)                | 계정 검증, JWT 발급, Strategy와 Guard 연결  | 입력 검사, 계정 Repository, JWT 설정          | 토큰이 있으면 `GET /auth/me`가 `200`, 토큰이 없으면 `401`입니다.             |
| [03 내 시간표 조회](exercises/03-timetable-model/README.md)        | 관계 모델, 마이그레이션, 사용자별 조회 쿼리 | Controller와 변경 쿼리 복사용 파일            | DB에 만든 시간표 행이 그 사용자의 요청에만 나타납니다.                       |
| [04 Cron 동기화](exercises/04-lecture-sync/README.md)              | 동기화 Service와 10초 주기 Scheduler        | 보조 서버와 피드 저장 쿼리                    | 보조 서버 강의 2001–2004가 개설강의에 생깁니다.                              |
| [05 강의 삭제 이벤트](exercises/05-lecture-delete-event/README.md) | 이벤트를 발행하고 시간표 Handler에서 처리   | 삭제 상태를 기록하는 쿼리와 이벤트 타입       | 강의를 지우면 연결 행도 DB에서 사라집니다.                                   |
| [06 시간표 담기·빼기](exercises/06-timetable-api/README.md)        | 시간 겹침 검사와 사용자별 추가·삭제         | HTTP 라우트, Guard, DB 변경 쿼리              | 시간이 겹치는 강의는 `409`이고, 시간이 맞닿는 강의는 담깁니다.               |
| [07 강의 리뷰](exercises/07-reviews/README.md)                     | 공개 조회, 작성, 작성자 확인 후 삭제        | 리뷰 모델, 예시 리뷰, Controller와 Repository | 다른 사람의 리뷰를 지우면 `403`이고 행이 유지됩니다.                         |
| [08 리뷰 하트](exercises/08-review-hearts/README.md)               | 하트 관계와 마이그레이션, 카운트 트랜잭션   | HTTP 라우트와 복사용 Repository               | 중복 요청에도 한 번만 반영되고, 카운트 갱신이 실패하면 하트 행도 롤백됩니다. |

문제의 `TODO(단계)`부터 찾고, 작은 단계 하나를 끝낼 때마다 문서의 요청을 실행하세요. 이전 응답이 유지되는지도 함께 확인하면 어느 변경에서 오류가 생겼는지 찾기 쉽습니다.

```sh
git grep -n -F 'TODO(' -- apps/api exercises
pnpm check
pnpm format:check
```

## 코드에서 요청이 지나가는 길

```text
HTTP 요청 → Controller ────┐
시간 트리거 → Scheduler ───┼→ Service → Repository → Prisma → MySQL
앱 내부 이벤트 → Handler ──┘
```

| 위치                                                           | 읽을 것                                                                                                                                                 |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [apps/api/src/main.ts](apps/api/src/main.ts)                   | Nest를 시작하고 공통 경로 `/api`를 붙입니다.                                                                                                            |
| [apps/api/src/app.module.ts](apps/api/src/app.module.ts)       | 기능별 모듈과 공통 이벤트 기능을 등록합니다.                                                                                                            |
| [apps/api/src](apps/api/src)                                   | 기능별로 `presentation/`, `service/`, `repository/`를 둡니다. Presentation이 입력을 받고 Service가 규칙을 판단하고 Repository가 데이터를 읽거나 씁니다. |
| [apps/api/prisma/schema.prisma](apps/api/prisma/schema.prisma) | 모델과 관계 정의입니다. 이 파일을 기준으로 Client를 생성합니다.                                                                                         |
| [apps/api/prisma/migrations](apps/api/prisma/migrations)       | 실제 DB에 적용할 변경 SQL입니다. 스키마 변경과 함께 커밋합니다.                                                                                         |
| [apps/source](apps/source) · [apps/web](apps/web)              | 강의 피드와 테스트 화면입니다. 실습에서 필요한 경우 실행해서 결과를 확인합니다.                                                                         |
| [packages/contracts](packages/contracts)                       | API, 화면, 보조 서버가 공통으로 사용하는 응답 형태입니다.                                                                                               |

예를 들어 06에서 시간표에 강의를 담으면 Controller가 토큰의 사용자 ID와 URL의 강의 ID를 읽습니다. Service가 두 강의의 수업시간을 비교한 뒤 충돌이면 `409`를 던집니다. 담아도 되는 경우 Repository를 호출해 사용자와 강의를 잇는 DB 행을 추가합니다.

## 초기 데이터와 테스트 계정

| 항목                         | 값                                                                                |
| ---------------------------- | --------------------------------------------------------------------------------- |
| 첫 번째 계정                 | `student`, 사용자 ID `1`                                                          |
| 두 번째 계정                 | `student2`, 사용자 ID `2`                                                         |
| 두 계정의 로컬 실습 비밀번호 | `mini-otl-2026`                                                                   |
| 기본 예시 강의               | 자료구조 `1001`, 신호 및 시스템 `1005`                                            |
| 06 충돌 예시                 | `1006`은 `1001`과 월요일에 겹치고, `1007`은 수요일에 `1001`이 끝날 때 시작합니다. |
| 07·08 리뷰 예시              | `student2`가 쓴 자료구조 `1001`의 리뷰 한 건입니다.                               |
| 04·05 보조 서버 예시         | `2001`–`2004`가 피드에 있고, 예약 DELETE는 `2001`을 대상으로 합니다.              |

초기 계정의 평문 비밀번호와 `.env`의 키는 이 로컬 실습용입니다. 서버와 DB는 기본 설정에서 로컬 주소에 바인딩합니다.

## API 빠른 참고

경로는 `$API` 뒤에 붙입니다. `Bearer`는 02에서 발급받은 토큰을 `Authorization: Bearer <토큰>` 헤더로 전달한다는 뜻입니다.

| 단계 | 메서드와 경로                                         | 인증                     | 성공                 |
| ---- | ----------------------------------------------------- | ------------------------ | -------------------- |
| 01   | `GET /lectures`                                       | 공개                     | `200` 강의 배열      |
| 02   | `POST /auth/login`                                    | 공개                     | `200` 토큰과 사용자  |
| 02   | `GET /auth/me`                                        | Bearer                   | `200` 요청 사용자 ID |
| 03   | `GET /timetable`                                      | Bearer                   | `200` 내 강의 배열   |
| 05   | `DELETE /lectures/:id`                                | 로컬 보조 서버에서 호출  | `204`                |
| 06   | `POST /timetable/lectures/:id`                        | Bearer                   | `204`                |
| 06   | `DELETE /timetable/lectures/:id`                      | Bearer                   | `204`                |
| 07   | `GET /lectures/:lectureId/reviews`                    | 공개, 토큰이 있으면 사용 | `200` 리뷰 배열      |
| 07   | `POST /lectures/:lectureId/reviews`                   | Bearer                   | `201` 작성한 리뷰    |
| 07   | `DELETE /lectures/:lectureId/reviews/:reviewId`       | 작성자의 Bearer          | `204`                |
| 08   | `POST /lectures/:lectureId/reviews/:reviewId/heart`   | Bearer                   | `204`                |
| 08   | `DELETE /lectures/:lectureId/reviews/:reviewId/heart` | Bearer                   | `204`                |

- `204`는 응답 본문이 없는 성공입니다. 터미널에 JSON이 보이지 않아도 상태 줄을 확인하세요.
- `400`은 입력 형식, `401`은 로그인 정보나 인증, `403`은 인증된 사용자의 권한을 확인합니다.
- `404`가 나오면 아직 등록되지 않은 라우트인지, 경로의 리소스가 없는지 응답 본문을 봅니다. `501`이면 그 기능의 TODO가 남아 있습니다.
- `409`는 시간표 충돌 또는 같은 강의에 대한 중복 리뷰입니다. 시간표 충돌 응답은 `conflictingLectureId`로 겹친 강의를 알려줍니다.

## MySQL과 마이그레이션

03과 08에서는 다음 순서로 작업합니다. 마이그레이션 이름은 문제 문서에 나옵니다.

1. `schema.prisma`에 모델, 필드, 관계를 추가합니다.
2. MySQL이 켜진 상태에서 `pnpm db:migrate --name 이름`을 실행합니다. Prisma가 개발용 shadow DB에서 이력을 비교하고 새 변경 SQL을 생성해 실습 DB에 적용합니다.
3. `pnpm db:generate`로 Prisma Client를 현재 스키마에 맞춥니다. Nest가 이전 Client를 사용하면 개발 서버를 재시작합니다.
4. 생성된 `migration.sql`과 스키마를 함께 커밋합니다.

직접 SQL을 실행하는 문제에서는 아래 함수를 **요청을 보내는 터미널에서 한 번** 등록하세요. 실행 중인 Compose 서비스 안의 MySQL 클라이언트를 사용합니다.

```sh
db_sql() {
  docker compose exec -T mysql sh -c \
    'exec mysql -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"'
}

db_sql <<'SQL'
SHOW TABLES;
SELECT id, username FROM User ORDER BY id;
SQL
```

### 종료와 재실행

- `Ctrl+C`는 해당 터미널에서 실행 중인 개발 서버를 종료합니다.
- `pnpm db:down`은 컨테이너를 내리고 실습 데이터 볼륨을 남깁니다. 다시 `pnpm dev`를 실행하면 이전 데이터가 보입니다.
- 다른 브랜치의 답안을 실제로 실행할 때는 별도 DB를 권장합니다. 직접 생성한 마이그레이션과 답안의 마이그레이션은 파일 이름과 이력이 다를 수 있습니다. `git show`로 답안만 읽을 때는 DB를 바꿀 필요가 없습니다.
- 새 DB를 나란히 쓰려면 별도 체크아웃의 `.env`에서 `MYSQL_PORT`, `DATABASE_URL`, `SHADOW_DATABASE_URL`에 같은 새 포트(예: `13307`)를 설정하고, 그 체크아웃에서 `export COMPOSE_PROJECT_NAME=mini-otl-answer`를 실행한 뒤 관련 명령을 실행하세요. 다른 터미널에서 `db_sql`을 호출할 때도 같은 Compose 프로젝트 이름을 설정하세요. 앱 포트는 기존 앱을 종료해서 비워 둡니다.
- 실습 DB를 처음부터 다시 만들고 싶고 기존 데이터가 필요 없을 때만 `docker compose down -v`를 실행하세요. 현재 Compose 프로젝트의 DB 볼륨을 지웁니다.

## 답안 보는 법

현재 코드에 직접 답을 덮어쓰지 않고 커밋 단위로 확인할 수 있습니다. 아래 명령은 조직 저장소에서 직접 복제한 경우입니다.

```sh
git fetch origin
git log --reverse --oneline origin/main..origin/guided-answer
FIRST_STEP=$(git rev-list --reverse origin/main..origin/guided-answer | head -n 1)
git show "$FIRST_STEP"
```

포크에 답안 브랜치가 없다면 아래처럼 조직 저장소를 원격 저장소로 추가하고 가져오세요.

```sh
git remote add upstream https://github.com/sparcs-kaist/sparcs-be-seminar-training-otl.git
git fetch upstream
git log --reverse --oneline upstream/main..upstream/guided-answer
```

위 예시는 첫 번째 답안 커밋을 엽니다. 현재 문제의 답안을 보려면 목록에서 같은 문제 번호가 붙은 커밋 해시를 골라 `git show`에 전달하세요. 03a와 08a에는 답안에서 실제로 생성한 마이그레이션 SQL도 있습니다.

## 자주 막히는 지점

| 증상                                                   | 확인할 것                                                                                                                                    |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm` 또는 `docker compose` 명령을 찾지 못합니다.     | 도구 설치를 확인하고 새 터미널을 열어 버전 명령을 다시 실행합니다.                                                                           |
| `pnpm dev`에서 Docker 연결 오류가 납니다.              | Docker가 켜져 있는지 `docker info`로 확인합니다.                                                                                             |
| `address already in use` 또는 `EADDRINUSE`가 나옵니다. | 다른 실습 프로세스나 컨테이너가 3000, 3001, 3002, 13306 중 같은 포트를 쓰는지 확인합니다. `docker compose ps`와 기존 실행 터미널부터 보세요. |
| `curl`이 연결을 거부합니다.                            | Nest 실행 터미널에 시작 로그가 있는지, 명령의 포트가 3001인지 확인합니다. 요청을 보내는 터미널의 `$API`도 확인합니다.                        |
| 보호 API가 계속 `401`입니다.                           | 02에서 토큰을 다시 발급받고 같은 터미널에서 요청합니다. `-H "Authorization: Bearer $TOKEN"`의 공백과 큰따옴표를 확인하세요.                  |
| 스키마를 바꿨는데 Prisma에 모델이 없습니다.            | 스키마 경로, 마이그레이션 결과, `pnpm db:generate` 순으로 확인한 뒤 Nest를 재시작합니다.                                                     |
| Prisma가 DB 초기화를 요구합니다.                       | 이전에 실행한 브랜치와 현재 브랜치의 마이그레이션 이력이 같은지 확인합니다. 데이터를 유지해야 한다면 별도 DB로 실행하세요.                   |
| `200`인데 시간표가 빈 배열입니다.                      | 03의 SQL 또는 06의 담기 요청을 실행했는지, 담은 계정과 조회한 토큰이 같은지 확인합니다.                                                      |
| 보조 서버의 강의가 개설강의에 안 들어옵니다.           | 먼저 포트 3002의 피드를 확인한 다음 Nest의 Cron 로그를 봅니다. 동기화 주기는 10초입니다.                                                     |
| Next 화면과 직접 보낸 요청의 상태가 다릅니다.          | 포트 3001의 API를 기준으로 확인합니다. 직접 요청의 본문과 Nest 로그에서 실패한 메서드를 찾으세요.                                            |
