# 07 · 강의 리뷰와 작성자 권한

강의 리뷰는 로그인 없이 읽을 수 있습니다. 로그인한 사용자는 자신의 이름으로 리뷰를 쓸 수 있고, 리뷰를 삭제하려면 그 리뷰의 작성자여야 합니다. 이번 문제에서는 **누가 로그인했는지**와 **그 사람이 이 리뷰를 삭제할 수 있는지**를 각각 확인합니다.

## 시작하기

- 02에서 발급한 `$TOKEN`과 `$STUDENT2_TOKEN`을 준비합니다.
- 초기 DB에는 자료구조(1001)에 `student2`가 쓴 리뷰가 한 건 있습니다. 권한 검사와 08의 하트 테스트에 사용합니다.
- [ReviewsController](../../apps/api/src/reviews/presentation/reviews.controller.ts)는 경로 ID, 입력 본문, JWT를 처리합니다. [ReviewRepository](../../apps/api/src/reviews/repository/review.repository.ts)는 DB 쿼리를 제공합니다.
- [ReviewsService](../../apps/api/src/reviews/service/reviews.service.ts)의 `findAll`, `create`, `remove`를 순서대로 채우세요.

```sh
REVIEWS="$API/lectures/1001/reviews"
```

`1001`은 강의 ID입니다. 조회 응답에 나오는 개별 리뷰의 `id`는 리뷰 ID이고, 삭제 URL에서는 두 ID를 모두 사용합니다.

## 07a · 공개 조회

1. `findAll(lectureId, viewerId)`에서 `LectureRepository.existsActive(lectureId)`를 호출합니다. 없는 강의나 폐지된 강의는 `404`입니다.
2. 활성 강의라면 `reviews.findForLecture(lectureId, viewerId)`의 값을 반환합니다. 로그인하지 않은 요청의 `viewerId`는 `undefined`일 수 있습니다. 이 값을 전달하면 08에서 로그인한 사용자의 하트 상태를 읽을 수 있습니다.

```sh
curl -i "$REVIEWS"
curl -i "$API/lectures/9999/reviews"
```

첫 요청은 `200`이고 자료구조의 예시 리뷰가 나옵니다. 두 번째는 `404`입니다. 응답의 각 항목에서 `id`, `lectureId`, `author.id`와 `author.name`, `content`, `createdAt`을 찾아보세요. 리뷰가 없는 활성 강의에는 빈 배열이 옵니다.

## 07b · 로그인한 사용자의 리뷰 작성

1. `create(lectureId, userId, content)`에서도 활성 강의를 확인합니다. 07a와 같은 판단은 Service 안의 작은 메서드로 묶을 수 있습니다.
2. `reviews.create()`에 강의 ID, 사용자 ID, 본문을 전달합니다. Controller가 토큰에서 사용자 ID를 가져옵니다. JSON 본문에는 `content`만 보내면 됩니다.
3. Repository가 `null`을 반환하면 같은 사용자가 해당 강의에 이미 리뷰를 쓴 경우입니다. `ConflictException`을 던져 `409`로 응답합니다.
4. 생성되면 Repository가 반환한 리뷰를 그대로 응답합니다. Nest가 POST 성공에 `201`을 사용합니다.

```sh
curl -i "$REVIEWS" -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"content":"자료구조 실습이 유익했어요."}'
curl -i "$REVIEWS" -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"content":"두 번째 리뷰를 써 봅니다."}'
curl -i "$REVIEWS" \
  -H 'Content-Type: application/json' -d '{"content":"로그인 없는 작성 요청"}'
curl -i "$REVIEWS" -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"content":"   "}'
```

처음 작성할 때 순서대로 `201`, `409`, `401`, `400`이 돌아옵니다. 네 번째 요청은 앞뒤 공백을 제거한 본문 길이가 1–500자여야 한다는 Controller 검사를 통과하지 못합니다. `201` 응답 또는 목록에서 작성자 ID가 1인지 확인하세요.

## 07c · 작성자만 삭제하기

`remove(lectureId, reviewId, userId)`에서 아래 순서로 확인합니다.

1. 강의가 활성 상태인지 확인합니다.
2. `reviews.findAuthor(lectureId, reviewId)`로 그 강의의 리뷰와 작성자를 찾습니다. 결과가 없으면 `404`입니다.
3. 작성자의 ID가 요청 사용자의 ID와 다르면 `ForbiddenException`을 던집니다. 요청자는 로그인했지만 해당 리뷰를 삭제할 권한이 없으므로 `403`입니다.
4. 작성자가 맞으면 `reviews.remove(reviewId)`를 호출합니다. 그 사이 행이 사라져 삭제 건수가 0이면 `404`입니다.

### 내 리뷰 ID와 상대 리뷰 ID 찾기

```sh
MY_REVIEW_ID=$(curl -fsS "$REVIEWS" \
  | node -pe 'JSON.parse(require("node:fs").readFileSync(0, "utf8")).find(row => row.author.id === 1).id')
REVIEW_ID=$(curl -fsS "$REVIEWS" \
  | node -pe 'JSON.parse(require("node:fs").readFileSync(0, "utf8")).find(row => row.author.id === 2).id')
```

### 같은 토큰으로 다른 리뷰 두 개 삭제 요청하기

```sh
curl -i -X DELETE "$REVIEWS/$REVIEW_ID" -H "Authorization: Bearer $TOKEN"
curl -i -X DELETE "$REVIEWS/$MY_REVIEW_ID" -H "Authorization: Bearer $TOKEN"
curl -i "$REVIEWS"
```

다른 사람의 리뷰는 `403`이고 목록에 남습니다. 내 리뷰는 `204`이고 목록에서 빠집니다. 같은 ID로 내 리뷰를 다시 지우면 `404`입니다. `student2`의 예시 리뷰와 `$REVIEW_ID`는 08에 사용합니다.

Next 화면에서는 강의 제목을 눌러 리뷰를 펼칠 수 있습니다. 다른 사람의 리뷰에 대한 권한 검사는 위처럼 직접 API를 보내면 확인할 수 있습니다.

## 막혔을 때

- 첫 작성부터 `409`라면 같은 사용자로 이전에 작성한 리뷰가 있는지 목록을 확인하세요.
- 다른 사람의 리뷰가 지워진다면 작성자 확인을 삭제 호출 전에 하는지 보세요.
- 작성한 사람인데 `403`이라면 토큰의 사용자 ID와 리뷰의 `author.id`를 비교하세요.
- 존재하는 리뷰가 `404`라면 URL의 강의 ID와 리뷰 ID를 바꾸어 적지 않았는지, 리뷰가 실제로 그 강의에 속하는지 확인하세요.

[이전 문제 · 06 시간표 담기](../06-timetable-api/README.md) · [전체 실습 순서](../../README.md#실습-순서) · [다음 문제 · 08 하트](../08-review-hearts/README.md)
