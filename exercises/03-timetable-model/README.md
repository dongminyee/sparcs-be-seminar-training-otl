# 03 · 시간표 모델과 내 시간표 조회

학생 한 명이 여러 강의를 담고, 강의 한 개를 여러 학생이 담을 수 있습니다. 이 관계를 MySQL 테이블로 만든 뒤, 토큰의 사용자 ID로 그 사람의 개설강의만 조회합니다. 이번 단계에서는 DB 행을 SQL로 한 건 넣어 조회를 먼저 확인합니다. HTTP로 담고 빼는 기능은 06에서 만듭니다.

## 시작하기

- 02의 로그인과 `GET /auth/me`가 동작하는지 확인합니다.
- 같은 요청 터미널에 `$API`, `$TOKEN`, `$STUDENT2_TOKEN`을 준비합니다. 새 터미널이라면 [02의 토큰 발급 절차](../02-login/README.md#두-사용자의-토큰-저장하기)를 다시 실행하세요.
- DB 확인 명령에 쓸 `db_sql` 함수는 [루트 README](../../README.md#mysql과-마이그레이션)에 있습니다. 같은 터미널에 한 번 등록하면 05와 08에서도 쓸 수 있습니다.

## 03a · 연결 테이블 설계하기

```text
User.id ← TimetableLecture.userId
Lecture.id ← TimetableLecture.lectureId
```

예를 들어 `(userId: 1, lectureId: 1005)`는 사용자 1의 시간표에 강의 1005가 들어 있다는 뜻입니다. 이 행이 강의 제목과 수업시간을 따로 보관하지 않아도, 강의 ID를 따라가 원래 데이터를 읽을 수 있습니다.

[Prisma 스키마](../../apps/api/prisma/schema.prisma)의 `TODO(03a)`를 찾아 모델을 추가합니다.

| 항목      | 요구 사항                                                                                                                                            |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 모델 이름 | `TimetableLecture`                                                                                                                                   |
| 연결 필드 | `userId Int`, `lectureId Int`                                                                                                                        |
| 관계      | `User.id`와 `Lecture.id`를 각각 참조합니다. `User`와 `Lecture`에는 역관계 배열 `timetable`을 추가합니다.                                             |
| 기본 키   | `@@id([userId, lectureId])`입니다. 두 값의 조합이 유일하므로 같은 사용자가 같은 강의를 한 번만 담을 수 있습니다.                                     |
| 인덱스    | `@@index([lectureId])`를 둡니다. 05에서 한 강의에 연결된 모든 사용자의 행을 찾을 때 씁니다.                                                          |
| 삭제 규칙 | 사용자 외래 키는 `onDelete: Cascade`, 강의 외래 키는 `onDelete: Restrict`입니다. 05에서는 강의 행에 삭제 시각을 쓰고 연결 행은 Handler가 정리합니다. |

`ClassTime` 모델에 이미 관계를 지정하는 `@relation(fields: [...], references: [...])`과 여러 필드를 묶는 `@@id`의 예가 있습니다. 기존 모델을 한 번 읽어 보고 시간표 관계에 적용하세요.

### 스키마를 실제 DB에 반영하기

```sh
pnpm db:migrate --name add_timetable
pnpm db:generate
git status --short
```

- `schema.prisma`는 원하는 데이터 구조를 선언합니다. 생성된 `migration.sql`은 기존 DB에 그 구조를 적용할 변경 내역입니다.
- 새 SQL 파일은 `apps/api/prisma/migrations/<시각>_add_timetable/migration.sql`에 생성됩니다. `CREATE TABLE`, 복합 기본 키, 두 외래 키를 찾으세요.
- `db:generate`는 TypeScript에서 새 모델을 사용할 수 있도록 Prisma Client를 생성합니다. Nest가 예전 Client를 사용하면 `pnpm dev`를 다시 시작합니다.

```sh
db_sql <<'SQL'
SHOW CREATE TABLE TimetableLecture;
SELECT id, username FROM User ORDER BY id;
SELECT id, title FROM Lecture WHERE id = 1005;
SQL
```

`TimetableLecture`가 추가되고 기존 계정과 강의도 유지되어야 합니다. 스키마와 새 마이그레이션을 함께 커밋하세요.

## 03b · 사용자별 시간표 조회하기

새 Prisma 모델을 사용하는 준비 코드가 [시간표 Repository](support/timetable.repository.ts)에 있습니다. 스키마와 Client 생성이 끝났으면 아래처럼 복사합니다. 이때 복사 대상은 `apps/api/src` 아래의 런타임 파일입니다.

```sh
cp exercises/03-timetable-model/support/timetable.repository.ts \
  apps/api/src/timetable/repository/timetable.repository.ts
```

1. 복사한 파일의 `findByUser(userId, db)`를 채웁니다. `db.timetableLecture.findMany()`에서 `userId`가 일치하고 연결된 `lecture.deletedAt`이 `null`인 행을 찾습니다.
2. `select`로 연결된 `lecture`를 선택할 때 01의 `lectureSelection`을 가져와 사용합니다. 정렬은 `lecture.code`, `lectureId` 순입니다.
3. Prisma가 읽은 값은 `[{ lecture: {...} }, ...]` 형태입니다. 각 행에서 `lecture`만 꺼내 API가 요구하는 강의 배열을 만듭니다.
4. [TimetableService.findMine()](../../apps/api/src/timetable/service/timetable.service.ts)이 받은 사용자 ID를 Repository에 전달하게 합니다. [TimetableController](../../apps/api/src/timetable/presentation/timetable.controller.ts)는 이미 Guard에서 확인한 `request.user.id`를 Service에 전달합니다.

## 확인하기

### 토큰과 빈 시간표 확인

```sh
curl -i "$API/timetable"
curl -i "$API/timetable" -H "Authorization: Bearer $TOKEN"
```

토큰이 없으면 `401`이고, 새 시간표는 `200 []`입니다.

### SQL로 행 하나 넣고 두 계정 비교하기

```sh
db_sql <<'SQL'
INSERT IGNORE INTO TimetableLecture (userId, lectureId)
SELECT id, 1005 FROM User WHERE username = 'student';
SELECT userId, lectureId FROM TimetableLecture ORDER BY userId, lectureId;
SQL

curl -fsS "$API/timetable" -H "Authorization: Bearer $TOKEN"
curl -fsS "$API/timetable" -H "Authorization: Bearer $STUDENT2_TOKEN"
```

첫 계정에는 신호 및 시스템(1005)과 수업시간이 나타나고, 두 번째 계정은 빈 배열을 반환합니다. `INSERT IGNORE`로 같은 명령을 재실행해도 중복 행을 만들지 않습니다. 05에서도 이 행을 사용하므로 DB에 남겨 둡니다.

## 막혔을 때

- Prisma Client에 `timetableLecture`가 없으면 스키마 변경과 Client 생성이 끝났는지 확인하세요.
- `Table ... doesn't exist`가 나오면 Client 생성과 별개로 마이그레이션이 DB에 적용됐는지 `SHOW TABLES`로 확인하세요.
- `501`이면 복사한 런타임 파일과 Service에 `03b` 스텁이 남아 있는지 확인하세요.
- 두 계정에서 같은 강의가 나오면 쿼리에 사용자 ID 조건을 넣었는지, 두 요청이 서로 다른 토큰을 쓰는지 확인하세요.

[이전 문제 · 02 로그인](../02-login/README.md) · [전체 실습 순서](../../README.md#실습-순서) · [다음 문제 · 04 동기화](../04-lecture-sync/README.md)
