# 07 · 강의 리뷰와 작성자 권한

`Review` 테이블, `student2`의 예시 리뷰, HTTP 입력 검사와 [ReviewRepository](../../apps/api/src/reviews/repository/review.repository.ts)가 제공됩니다. [ReviewsService](../../apps/api/src/reviews/service/reviews.service.ts)의 세 메서드를 순서대로 채우세요. 작성·삭제에 쓰는 사용자 ID는 로그인 토큰에서 가져옵니다.

## 07a · 리뷰 조회

`findAll(lectureId, viewerId)`에서 먼저 강의가 열려 있는지 `LectureRepository.existsActive()`로 확인합니다. 없거나 삭제된 강의는 `404`입니다. 있으면 `reviews.findForLecture(lectureId, viewerId)`의 결과를 반환합니다.

```sh
REVIEWS=http://127.0.0.1:3001/api/lectures/1001/reviews
curl -i "$REVIEWS"
```

로그인 없이 `200`과 예시 리뷰를 확인합니다. 응답에는 리뷰 ID, 강의 ID, 작성자, 본문, 작성 시각이 들어 있습니다.

## 07b · 리뷰 작성

`create(lectureId, userId, content)`에서 강의가 열려 있는지 확인한 뒤 `reviews.create()`를 호출합니다. DB의 유일 제약은 같은 사람이 같은 강의에 리뷰를 두 번 쓰지 못하게 합니다. Repository가 이 경우 `null`을 반환하므로 Service에서 `ConflictException`으로 바꿉니다.

```sh
curl -i "$REVIEWS" -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"content":"자료구조 실습이 유익했어요."}'
```

첫 요청은 `201`, 같은 요청을 다시 보내면 `409`입니다. 인증 헤더를 빼면 `401`입니다. 본문을 잘라 1–500자인지 확인하는 코드는 Controller에 들어 있습니다.

## 07c · 작성자만 삭제하기

`remove(lectureId, reviewId, userId)`에서 강의가 열려 있는지 확인하세요. `reviews.findAuthor(lectureId, reviewId)`가 결과를 반환하지 않으면 `404`입니다. 작성자 ID와 요청 사용자 ID가 다르면 `ForbiddenException`을 던집니다. 일치할 때 `reviews.remove(reviewId)`를 호출하고, 그 사이 리뷰가 사라져 삭제 건수가 0이면 `404`를 반환하세요.

아래는 자료구조 리뷰에서 `student2`의 예시 리뷰 ID를 찾고, `student`의 토큰으로 삭제를 요청하는 명령입니다.

```sh
REVIEW_ID=$(curl -fsS "$REVIEWS" \
  | node -pe 'JSON.parse(require("node:fs").readFileSync(0, "utf8")).find(review => review.author.id === 2).id')
curl -i -X DELETE "$REVIEWS/$REVIEW_ID" -H "Authorization: Bearer $TOKEN"
```

`403`이 돌아오고, 다시 조회해도 예시 리뷰가 남아 있어야 합니다. 07b에서 응답받은 내 리뷰 ID로 요청하면 `204`이고 해당 리뷰가 목록에서 빠집니다. Next에서 강의 제목을 눌러도 리뷰 목록과 작성 화면을 확인할 수 있습니다.

[전체 실습 순서](../../README.md#실습-순서)
