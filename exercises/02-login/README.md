# 02 · 로그인과 JWT

초기 계정으로 로그인하고, 이후 요청에서 사용자를 식별할 수 있도록 JWT를 발급하고 검증합니다. [로그인 컨트롤러](../../apps/api/src/auth/presentation/auth.controller.ts)에서 시작하세요.

## 구현 범위

- `POST /api/auth/login`에서 `username`과 `password`를 받습니다. Repository에서 계정을 조회하고 Service에서 입력 비밀번호를 DB의 `password` 값과 직접 비교합니다.
- 성공하면 `200 { accessToken, user }`를 반환합니다. JWT에는 사용자 ID를 담고, 응답의 `user`에는 `id`, `username`, `name`을 담습니다.
- Passport JWT Strategy는 `Authorization: Bearer <token>`의 서명과 만료를 검증하고 요청에 사용자 ID를 전달합니다. 04단계에서 이 Strategy를 연결한 Guard를 적용합니다.

## 완료 확인

```sh
curl -i http://127.0.0.1:3001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"student","password":"mini-otl-2026"}'
```

- 초기 계정은 `200`과 `accessToken`을 받습니다. 응답에 비밀번호가 포함되면 안 됩니다.
- 틀린 비밀번호나 존재하지 않는 계정은 `401`, 필수 입력이 빠지면 `400`을 반환합니다.
- 발급받은 토큰은 04단계의 시간표 요청에 사용합니다.

[전체 실습 순서](../../README.md#실습-순서)
