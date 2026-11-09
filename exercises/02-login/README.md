# 02 · 초기 계정 로그인과 JWT

DB에 들어 있는 계정으로 로그인하고, 발급한 토큰으로 보호된 요청을 보내 봅니다. Controller의 입력 검사, 계정 조회 Repository, JWT 서명 설정과 토큰 추출은 제공됩니다.

## 02a · 토큰 발급

[AuthService.login()](../../apps/api/src/auth/service/auth.service.ts)을 채우세요.

1. `UserRepository.findByUsername()`으로 사용자를 찾습니다.
2. 사용자가 없거나 실습용 DB의 `password`와 입력이 다르면 `UnauthorizedException`을 던집니다.
3. `JwtService.signAsync()`로 사용자 ID를 `sub`에 담은 토큰을 만듭니다. 응답은 `{ accessToken, user: { id, username, name } }`입니다.

```sh
curl -i http://127.0.0.1:3001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"student","password":"mini-otl-2026"}'
```

맞는 계정은 `200`과 토큰, 틀린 비밀번호는 `401`, 필수 입력을 빼면 `400`입니다. 응답에 비밀번호가 없는지 확인하세요.

## 02b · 토큰으로 요청 사용자 확인

1. [JwtStrategy.validate()](../../apps/api/src/auth/presentation/jwt.strategy.ts)에서 `sub`가 양의 정수인지 확인합니다. 잘못된 값에는 `UnauthorizedException`을 던지고, 성공하면 `{ id: sub }`를 반환합니다. Passport가 이 값을 `request.user`에 넣습니다.
2. [AuthController](../../apps/api/src/auth/presentation/auth.controller.ts)에 `GET /api/auth/me`를 추가합니다. `@UseGuards(JwtAuthGuard)`를 붙이고 `@Req()`에서 읽은 `user`를 그대로 반환합니다.

아래 명령은 로그인 응답에서 토큰만 꺼냅니다. 이후 실습도 같은 터미널에서 진행하면 `$TOKEN`을 재사용할 수 있습니다.

```sh
TOKEN=$(curl -fsS http://127.0.0.1:3001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"student","password":"mini-otl-2026"}' \
  | node -pe 'JSON.parse(require("node:fs").readFileSync(0, "utf8")).accessToken')

curl -i http://127.0.0.1:3001/api/auth/me
curl -i http://127.0.0.1:3001/api/auth/me -H "Authorization: Bearer invalid"
curl -i http://127.0.0.1:3001/api/auth/me -H "Authorization: Bearer $TOKEN"
```

순서대로 `401`, `401`, `200 {"id":1}`을 확인하세요. 토큰이 만료되면 로그인 명령으로 다시 발급받습니다.

[전체 실습 순서](../../README.md#실습-순서)
