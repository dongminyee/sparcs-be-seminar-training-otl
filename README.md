# Mini OTL 백엔드 실습

SPARCS 신입 세미나에서 개설강의, 시간표, 리뷰 API를 단계별로 만듭니다. `main`에서 개인 실습 브랜치를 만들고, 문제의 `TODO(단계)`를 순서대로 채우세요. 새 단계별 답안은 `guided-answer`에 있습니다. `answer`는 기존 완성본을 보관한 브랜치입니다. GitHub에서 포크할 때 답안도 가져오려면 **Copy the main branch only**를 해제하세요.

## 시작하기

Node.js 22.12 이상, pnpm 10, Docker Compose가 필요합니다. Docker를 실행한 뒤 저장소 루트에서 시작하세요.

```sh
git switch main
git switch -c my-seminar
pnpm install --frozen-lockfile
pnpm dev
```

- Nest API는 `http://127.0.0.1:3001/api`에서 열립니다. 요청과 응답은 먼저 이 주소에 `curl -i`로 확인하세요.
- Next 화면은 `http://127.0.0.1:3000`입니다. Nest가 구현되는 대로 같은 기능을 화면에서 쓸 수 있습니다. 화면 코드는 제공됩니다.
- MySQL은 Docker에서 실행됩니다. `pnpm dev`가 현재 브랜치의 마이그레이션을 적용하고 Prisma Client를 생성합니다.
- 보조 서버는 04에서 별도 터미널에 `pnpm dev:source`로 켭니다. 포트는 3002입니다.
- 실습 계정은 `student`와 `student2`이며, 두 계정의 로컬 실습용 비밀번호는 `mini-otl-2026`입니다. 자료구조(1001)에 `student2`의 예시 리뷰가 한 건 들어 있습니다.

```sh
curl -i http://127.0.0.1:3001/api/health
```

`200`과 `{"status":"ok"}`가 오면 Nest가 켜졌습니다. 아직 만들지 않은 라우트는 `404`, 메서드 본문이 비어 있는 라우트는 `501`을 반환합니다. 보호 API는 토큰 검증을 먼저 합니다.

## 실습 순서

| 단계                                                               | 직접 만드는 것                                               |
| ------------------------------------------------------------------ | ------------------------------------------------------------ |
| [01 개설강의 조회](exercises/01-lectures/README.md)                | Nest 라우트, Prisma 조회, Controller·Service·Repository 분리 |
| [02 로그인](exercises/02-login/README.md)                          | 초기 계정 검증, JWT 발급, Strategy와 Guard로 보호한 API      |
| [03 내 시간표 조회](exercises/03-timetable-model/README.md)        | 관계 모델, 마이그레이션, 로그인한 사용자의 강의 조회         |
| [04 Cron 동기화](exercises/04-lecture-sync/README.md)              | 강의 피드 반영과 10초 주기 Scheduler                         |
| [05 강의 삭제 이벤트](exercises/05-lecture-delete-event/README.md) | 이벤트 발행과 EventHandler의 시간표 정리                     |
| [06 시간표 담기·빼기](exercises/06-timetable-api/README.md)        | 같은 학기의 시간 충돌 검증과 내 시간표 수정                  |
| [07 강의 리뷰](exercises/07-reviews/README.md)                     | 공개 조회, 리뷰 작성, 작성자 확인 후 삭제                    |
| [08 리뷰 하트](exercises/08-review-hearts/README.md)               | 하트 관계 모델, 마이그레이션, 하트와 카운트 트랜잭션         |

Presentation의 Controller, Scheduler, EventHandler가 각 입력을 받습니다. Service에서 기능의 규칙을 판단하고, Repository에서 Prisma로 DB를 읽거나 씁니다. `apps/api`에서 단계 번호로 TODO를 찾을 수 있습니다.

```sh
git grep -n -F 'TODO(' -- apps/api exercises
pnpm check
git log --reverse --oneline main..guided-answer
```

답안 커밋을 따로 보고 싶다면 `git show <커밋>`을 쓰세요. 직접 실습한 DB와 답안 DB는 마이그레이션 이름과 이력이 달라질 수 있습니다. 브랜치를 바꿔 실행할 때는 별도 실습 DB를 사용하거나, 기존 실습 데이터가 필요 없을 때만 앱을 종료한 뒤 `docker compose down -v`로 실습 DB를 초기화하세요. 이 명령은 해당 Compose 프로젝트의 데이터 볼륨을 삭제합니다. 데이터를 남기고 종료하려면 `pnpm db:down`을 사용하세요.
