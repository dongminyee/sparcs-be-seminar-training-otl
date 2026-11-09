# 08 · 리뷰 하트와 트랜잭션

사용자가 하트를 누르면 DB의 두 곳이 바뀝니다. `review_heart`에 사용자와 리뷰를 잇는 행이 생기고, 리뷰의 `heart_count`가 1 올라갑니다. 취소할 때는 행을 지우고 카운트를 1 내립니다. 트랜잭션은 두 변경이 함께 저장되거나 함께 되돌아가게 합니다.

이번 문제의 최종 기준은 **저장된 `heart_count`가 실제 하트 행 수와 같다**는 것입니다. 정상 요청, 같은 요청 반복, 중간 실패에서 각각 이 조건을 확인합니다.

## 시작하기

- 07의 `$REVIEWS`와 `$REVIEW_ID`가 `student2`가 작성한 자료구조(1001)의 예시 리뷰를 가리키는지 확인하세요.
- `$TOKEN`은 `student`의 토큰입니다. `$STUDENT2_TOKEN`으로는 자기 리뷰에 하트를 누르는 요청을 테스트할 수 있습니다.
- SQL 검증은 [루트 README의 `db_sql` 함수](../../README.md#mysql과-마이그레이션)를 사용합니다.

## 08a · 새 모델과 기존 리뷰 필드 추가

[Prisma 스키마](../../apps/api/prisma/schema.prisma)의 `TODO(08a)`를 따라 수정합니다.

| 위치                  | 추가할 내용                                                                                                                                           |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ReviewHeart`         | `reviewId Int`와 `userId Int`를 두고 각각 `Review.id`와 `User.id`를 참조합니다.                                                                       |
| `ReviewHeart` 제약    | `@@id([reviewId, userId])`로 한 사람이 같은 리뷰에 하트를 한 번만 누를 수 있게 합니다. `userId`에 인덱스를 두고 `@@map("review_heart")`를 설정합니다. |
| `ReviewHeart` 외래 키 | 리뷰 삭제 시 해당 하트도 정리하도록 리뷰 외래 키는 `onDelete: Cascade`입니다. 사용자 외래 키는 `onDelete: Restrict`입니다.                            |
| `Review`              | `hearts` 역관계 배열과 `heartCount Int @default(0) @map("heart_count")`를 추가합니다.                                                                 |
| `User`                | `reviewHearts` 역관계 배열을 추가합니다.                                                                                                              |

03에서 사용한 명시적 연결 모델과 비슷합니다. 이번에는 기존 `Review`의 필드도 추가합니다. 기본값 0이 있어 기존에 저장된 리뷰도 새 카운트 값을 갖게 됩니다.

```sh
pnpm db:migrate --name add_review_hearts
pnpm db:generate
```

생성된 `migration.sql`에서 기존 `review`에 카운트를 추가하는 구문, `review_heart`를 만드는 구문, 외래 키를 확인하세요.

```sh
db_sql <<'SQL'
SHOW CREATE TABLE review_heart;
SELECT id, lectureId, userId, heart_count FROM review WHERE lectureId = 1001;
SQL
```

예시 리뷰가 유지되고 카운트가 0이어야 합니다. 다음으로 08에서 제공하는 [하트 Repository](support/review.repository.ts)를 런타임 파일에 복사합니다.

```sh
cp exercises/08-review-hearts/support/review.repository.ts \
  apps/api/src/reviews/repository/review.repository.ts
```

복사한 파일은 하트 행 추가·제거, 카운트 갱신, 리뷰 조회 시 하트 상태 읽기를 제공합니다. Nest가 이전 Client를 사용하면 재시작하세요. `curl -fsS "$REVIEWS"`로 예시 리뷰에 `heartCount: 0`, `heartedByMe: false`가 붙었는지 확인합니다.

## 08b · Service에서 두 변경을 한 트랜잭션으로 묶기

[ReviewsService.setHeart()](../../apps/api/src/reviews/service/reviews.service.ts)를 채웁니다. Controller는 POST를 받으면 `hearted = true`, DELETE를 받으면 `hearted = false`를 전달합니다.

1. 07에서처럼 강의가 활성 상태인지 확인합니다.
2. `this.prisma.$transaction(async db => { ... })`을 엽니다. 여기서 `db`는 이 트랜잭션에 속한 Prisma Client입니다.
3. 콜백 안에서 `findAuthorForHeart(lectureId, reviewId, db)`를 호출합니다. 대상 리뷰가 없으면 `404`, 자신의 리뷰면 `403`입니다. Repository는 카운트 변경이 동시에 들어올 때 이 리뷰의 쓰기를 차례로 처리하도록 준비되어 있습니다.
4. `hearted`에 따라 `addHeart(reviewId, userId, db)` 또는 `removeHeart(reviewId, userId, db)`를 호출합니다. 각 쿼리의 반환값 `count`는 실제로 바뀐 행 수입니다.
5. `count`가 0보다 클 때만 `changeHeartCount(reviewId, delta, db)`를 호출합니다. 등록은 `delta = 1`, 취소는 `delta = -1`입니다.
6. 세 Repository 호출에 모두 콜백에서 받은 같은 `db`를 넘기고, 변경이 완료될 때까지 `await`합니다. 콜백에서 오류를 밖으로 던지면 Prisma가 변경을 롤백합니다.

이미 하트를 누른 사용자가 POST를 다시 보내면 연결 행은 그대로이고 `count`는 0입니다. 취소도 같은 원리입니다. 이 조건을 빠뜨리면 연결 행 수와 카운트가 달라집니다.

## 확인 1 · 등록과 취소를 두 번씩 보내기

```sh
curl -i -X POST "$REVIEWS/$REVIEW_ID/heart" -H "Authorization: Bearer $TOKEN"
curl -i -X POST "$REVIEWS/$REVIEW_ID/heart" -H "Authorization: Bearer $TOKEN"
curl -fsS "$REVIEWS" -H "Authorization: Bearer $TOKEN"

curl -i -X DELETE "$REVIEWS/$REVIEW_ID/heart" -H "Authorization: Bearer $TOKEN"
curl -i -X DELETE "$REVIEWS/$REVIEW_ID/heart" -H "Authorization: Bearer $TOKEN"
curl -fsS "$REVIEWS" -H "Authorization: Bearer $TOKEN"
```

변경 요청은 모두 `204`입니다. 첫 조회에서 예시 리뷰가 `heartCount: 1`, `heartedByMe: true`이고, 두 번째 조회에서는 0과 false입니다. 중간에 토큰 없이 조회하면 공개 카운트는 같고 `heartedByMe`는 false입니다.

토큰이 없거나 자신의 리뷰를 대상으로 할 때도 확인하세요.

```sh
curl -i -X POST "$REVIEWS/$REVIEW_ID/heart"
curl -i -X POST "$REVIEWS/$REVIEW_ID/heart" -H "Authorization: Bearer $STUDENT2_TOKEN"
```

순서대로 `401`, `403`입니다.

## 확인 2 · 두 변경이 모두 롤백되는지 보기

1. 예시 리뷰의 카운트가 0이고 `student`가 누른 하트가 없는 상태에서 시작합니다.
2. 트랜잭션 콜백에서 `await changeHeartCount(...)`를 호출하는 줄 바로 뒤에 `throw new Error("rollback demo")`를 잠시 추가합니다. 이 위치까지 도달하면 하트 행과 카운트가 트랜잭션 안에서 모두 변경된 상태입니다.
3. 저장 후 Nest에 직접 등록 요청을 보내 `500`을 확인합니다.
4. 아래 조회로 두 값이 여전히 0인지 확인하고, 테스트용 예외를 지웁니다.

```sh
curl -i -X POST "$REVIEWS/$REVIEW_ID/heart" -H "Authorization: Bearer $TOKEN"

db_sql <<'SQL'
SELECT r.id, r.heart_count, COUNT(h.userId) AS heart_rows
FROM review AS r
LEFT JOIN review_heart AS h ON h.reviewId = r.id
WHERE r.lectureId = 1001 AND r.userId = 2
GROUP BY r.id, r.heart_count;
SQL
```

예외를 제거하고 다시 등록하면 `204`이며 두 값이 모두 1이어야 합니다. 취소한 뒤에는 둘 다 0입니다. 실습이 끝나면 `pnpm check`를 실행하고 테스트용 예외가 남지 않았는지 `git diff`로 확인하세요.

## 막혔을 때

- `reviewHeart`나 `heartCount`를 찾을 수 없다면 마이그레이션과 Client 생성 뒤에 Repository를 복사했는지 확인하세요.
- 첫 POST부터 `403`이라면 토큰이 `student`의 것인지, 대상이 `student2`의 예시 리뷰인지 확인하세요.
- 등록을 반복할 때 카운트가 계속 올라가면 `count`가 0일 때도 카운트를 바꾸는지 보세요.
- 실패 후 행이나 숫자가 남으면 두 쓰기가 동일한 `db`를 사용하는지, 오류를 트랜잭션 콜백 안에서 삼키지 않는지 확인하세요.

[이전 문제 · 07 리뷰](../07-reviews/README.md) · [전체 실습 순서](../../README.md#실습-순서)
