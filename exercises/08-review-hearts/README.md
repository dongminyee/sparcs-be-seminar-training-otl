# 08 · 리뷰 하트와 트랜잭션

리뷰에 하트를 누르면 사용자와 리뷰를 잇는 행을 추가하고, 해당 리뷰의 카운트도 1 올립니다. 취소할 때는 행을 삭제하고 카운트를 1 내립니다. 두 쓰기를 함께 완료하거나 함께 취소하도록 구현합니다.

## 08a · 관계 모델과 마이그레이션

[Prisma 스키마](../../apps/api/prisma/schema.prisma)를 수정하세요.

- `ReviewHeart`에 `reviewId`와 `userId`를 두고 `Review`, `User`를 참조합니다. 사용자 한 명이 같은 리뷰에 하트를 한 번만 남길 수 있게 `@@id([reviewId, userId])`를 설정합니다. `userId`에 인덱스를 두고, 테이블 이름은 `@@map("review_heart")`로 정합니다.
- `Review.hearts`, `User.reviewHearts` 역관계 배열을 추가합니다. 리뷰를 삭제하면 해당 하트도 삭제되도록 리뷰 외래 키는 `onDelete: Cascade`로 둡니다. 사용자 외래 키는 `onDelete: Restrict`입니다.
- `Review`에 `heartCount Int @default(0) @map("heart_count")`를 추가합니다. 기존 리뷰도 처음에는 카운트가 0입니다.

```sh
pnpm db:migrate --name add_review_hearts
pnpm db:generate
cp exercises/08-review-hearts/support/review.repository.ts \
  apps/api/src/reviews/repository/review.repository.ts
```

제공된 [Repository](support/review.repository.ts)는 하트 등록·삭제와 카운트 갱신 쿼리, 리뷰 조회에서 하트 수와 내 선택 상태를 읽는 쿼리를 포함합니다. 스키마·마이그레이션·Repository를 적용한 뒤 Nest를 다시 시작하면 기존 리뷰 조회에 `heartCount: 0`과 `heartedByMe: false`가 보입니다.

## 08b · 하트와 카운트 함께 바꾸기

[ReviewsService.setHeart()](../../apps/api/src/reviews/service/reviews.service.ts)를 채우세요. Controller는 POST일 때 `hearted = true`, DELETE일 때 `false`를 넘깁니다.

1. 강의가 열려 있는지 확인하고 `this.prisma.$transaction(async db => { ... })`을 호출합니다.
2. 트랜잭션에서 `findAuthorForHeart(lectureId, reviewId, db)`로 해당 강의의 리뷰를 확인합니다. 없는 리뷰는 `404`, 자기 리뷰는 `403`입니다.
3. 같은 `db`로 `addHeart()` 또는 `removeHeart()`를 호출합니다. 이미 눌렀거나 취소한 상태면 반환된 `count`가 0입니다.
4. 실제로 행이 바뀐 경우에만 `changeHeartCount(reviewId, 1 또는 -1, db)`를 호출합니다. 콜백 안의 모든 DB 연산에 같은 `db`가 전달되는지 확인하세요.

## 확인하기

07에서 만든 `$REVIEWS`, `$REVIEW_ID`와 `student`의 `$TOKEN`을 사용합니다.

```sh
curl -i -X POST "$REVIEWS/$REVIEW_ID/heart" -H "Authorization: Bearer $TOKEN"
curl -i -X POST "$REVIEWS/$REVIEW_ID/heart" -H "Authorization: Bearer $TOKEN"
curl -fsS "$REVIEWS" -H "Authorization: Bearer $TOKEN"

curl -i -X DELETE "$REVIEWS/$REVIEW_ID/heart" -H "Authorization: Bearer $TOKEN"
curl -i -X DELETE "$REVIEWS/$REVIEW_ID/heart" -H "Authorization: Bearer $TOKEN"
curl -fsS "$REVIEWS" -H "Authorization: Bearer $TOKEN"
```

변경 요청은 모두 `204`입니다. 앞의 조회에는 예시 리뷰의 `heartCount: 1`, `heartedByMe: true`가 나타나고, 뒤의 조회에서는 0과 false로 돌아옵니다.

롤백을 확인하려면 하트 행 변경 직후 트랜잭션 콜백 안에 잠시 `throw new Error("rollback demo")`를 넣고 등록을 요청하세요. API가 `500`을 반환해도 다음 조회의 하트 수와 내 선택 상태는 그대로여야 합니다. 확인한 뒤 테스트용 예외를 지우고 등록을 다시 요청하세요.

[전체 실습 순서](../../README.md#실습-순서)
