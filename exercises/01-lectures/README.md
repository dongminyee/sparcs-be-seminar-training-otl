# 01 · 개설강의 조회

로그인하지 않은 사용자도 개설강의와 수업시간을 볼 수 있도록 공개 API를 만듭니다. [강의 컨트롤러](../../apps/api/src/lectures/presentation/lectures.controller.ts)의 조회 스텁에서 시작하세요.

## 구현 범위

- `GET /api/lectures`에서 `200 Lecture[]`를 반환합니다. 응답 필드는 [공통 계약](../../packages/contracts/index.ts)의 `Lecture` 타입을 따릅니다.
- Repository에서 Prisma로 `Lecture`와 연결된 `ClassTime`을 조회합니다. `deletedAt`이 설정된 강의는 제외합니다.
- 수업시간을 요일과 시작 시각 순으로 반환합니다. `day`는 월요일 0부터 금요일 4까지이며, `begin`과 `end`는 자정부터의 분 단위입니다.
- Controller에서 Service를 호출하고, Service에서 Repository를 호출합니다.

## 완료 확인

```sh
curl -i http://127.0.0.1:3001/api/lectures
```

- 인증 헤더 없이 `200`을 받고 자료구조(`1001`)의 강의 정보와 월·수 수업시간을 확인합니다.
- Next 화면을 비로그인 상태로 열어 강의 목록이 표시되는지 확인합니다.

[전체 실습 순서](../../README.md#실습-순서)
