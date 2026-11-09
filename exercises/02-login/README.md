# 02 · 초기 계정 로그인과 JWT

로그인은 계정 정보를 확인해 토큰을 발급하는 요청입니다. 그 뒤의 보호 요청은 사용자 이름이나 비밀번호를 다시 받지 않고, 토큰을 검증해 누가 요청했는지 알아냅니다. 이번에는 로그인과 보호 요청을 각각 호출해서 두 흐름을 확인합니다.

## 어디를 수정하나요?

| 파일                                                                      | 직접 채우는 부분                          |
| ------------------------------------------------------------------------- | ----------------------------------------- |
| [AuthService](../../apps/api/src/auth/service/auth.service.ts)            | `02a`의 계정 확인과 토큰 발급             |
| [JwtStrategy](../../apps/api/src/auth/presentation/jwt.strategy.ts)       | `02b`의 JWT `sub` 검증과 사용자 객체 반환 |
| [AuthController](../../apps/api/src/auth/presentation/auth.controller.ts) | `02b`의 `GET /auth/me`와 Guard 연결       |

[UserRepository](../../apps/api/src/auth/repository/user.repository.ts), [JwtAuthGuard](../../apps/api/src/auth/presentation/jwt-auth.guard.ts), [AuthModule](../../apps/api/src/auth/auth.module.ts)의 설정은 제공됩니다. `POST /auth/login`의 입력 형식 검사와 응답 상태 `200`도 Controller에 들어 있습니다.

## 02a · 계정을 확인하고 토큰 발급하기

1. `AuthService.login()`에서 받은 `username`으로 `UserRepository.findByUsername()`을 호출합니다. 결과는 사용자 객체 또는 `null`입니다.
2. 사용자 행이 없거나 입력한 `password`가 행의 실습용 비밀번호와 다르면 `UnauthorizedException`을 던집니다. 두 경우 모두 `401`입니다.
3. `JwtService.signAsync()`에 `{ sub: user.id }`를 넘깁니다. `sub`는 토큰이 나타내는 사용자를 담는 필드입니다. 서명 키와 만료 시간 2시간은 모듈에 설정되어 있습니다.
4. 응답에 토큰과 `user.id`, `user.username`, `user.name`을 담습니다. DB의 사용자 객체를 통째로 반환하면 비밀번호도 들어갈 수 있으므로 필요한 필드만 골라 담으세요.

### 올바른 계정으로 요청하기

```sh
curl -i "$API/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"username":"student","password":"mini-otl-2026"}'
```

`-d`를 붙이면 curl이 POST로 보내고, `Content-Type`은 JSON 본문임을 알립니다. 응답은 `200`이며 아래 구조를 갖습니다. `accessToken`의 내용은 발급 시마다 달라질 수 있습니다.

```json
{
  "accessToken": "<발급한 JWT>",
  "user": { "id": 1, "username": "student", "name": "김스팍스" }
}
```

### 잘못된 요청과 비교하기

```sh
curl -i "$API/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"username":"student","password":"wrong"}'
curl -i "$API/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"username":"student"}'
```

순서대로 `401`, `400`입니다. 첫 요청은 형식이 맞아 Service까지 가지만 계정 검증에 실패합니다. 두 번째는 비밀번호 필드가 없어 Controller에서 실패합니다.

## 02b · Strategy와 Guard 연결하기

```text
Authorization 헤더 → JwtAuthGuard → Passport JWT Strategy
                                  → 서명·만료 검증 → validate(payload)
                                  → request.user → AuthController.me()
```

Strategy의 생성자는 이미 Bearer 헤더에서 토큰을 읽고 설정된 키로 검증하도록 연결되어 있습니다.

1. `JwtStrategy.validate()`에서 받은 `sub`가 숫자이며 양의 안전한 정수인지 확인합니다. TypeScript에서 `sub`는 `unknown`일 수 있으므로 타입 확인도 필요합니다.
2. 잘못된 값은 `UnauthorizedException`으로 처리하고, 성공하면 `{ id: sub }`를 반환합니다. Passport가 이 값을 `request.user`에 넣습니다.
3. AuthController에 `@Get("me")`와 `@UseGuards(JwtAuthGuard)`가 붙은 메서드를 추가합니다. `@Req()`로 받은 요청에서 `user`를 반환하세요. 제공된 `AuthenticatedUser` 타입을 쓸 수 있습니다.

### 두 사용자의 토큰 저장하기

아래 함수를 요청 터미널에 붙여 넣으면 이후 문제에서 토큰을 쉽게 다시 발급받을 수 있습니다. curl의 `-f`는 실패 응답을 오류로 처리하고, Node 명령은 JSON에서 `accessToken`만 꺼냅니다. 이 명령은 Bash와 Zsh에서 실행할 수 있습니다.

```sh
login_token() {
  curl -fsS "$API/auth/login" \
    -H 'Content-Type: application/json' \
    -d "{\"username\":\"$1\",\"password\":\"mini-otl-2026\"}" \
    | node -pe 'JSON.parse(require("node:fs").readFileSync(0, "utf8")).accessToken'
}

TOKEN=$(login_token student)
STUDENT2_TOKEN=$(login_token student2)
```

토큰은 터미널에서 재사용하고 Git에 커밋할 필요가 없습니다. 새 터미널을 열거나 토큰이 만료되면 함수를 다시 등록해 발급받으세요.

### 보호 요청 네 가지 확인하기

```sh
curl -i "$API/auth/me"
curl -i "$API/auth/me" -H 'Authorization: Bearer invalid'
curl -i "$API/auth/me" -H "Authorization: Bearer $TOKEN"
curl -i "$API/auth/me" -H "Authorization: Bearer $STUDENT2_TOKEN"
```

| 요청            | 기대 결과         |
| --------------- | ----------------- |
| 헤더 없음       | `401`             |
| 잘못된 토큰     | `401`             |
| `student` 토큰  | `200`, `{"id":1}` |
| `student2` 토큰 | `200`, `{"id":2}` |

## 막혔을 때

- 로그인 자체가 `501`이면 Service의 스텁 예외가 남아 있습니다.
- 로그인은 성공하는데 `/auth/me`가 `404`라면 GET 라우트와 경로를 확인하세요. 이 검증용 API는 Nest 포트 3001에 직접 요청합니다.
- `/auth/me`가 토큰 없이도 실행된다면 Guard가 그 메서드에 적용되었는지 확인하세요.
- 올바른 토큰도 `401`이라면 같은 터미널에서 발급했는지, 헤더의 `Bearer` 뒤에 공백이 있는지, Strategy의 `validate()`가 돌려주는 값이 무엇인지 확인하세요.

[이전 문제 · 01 개설강의](../01-lectures/README.md) · [전체 실습 순서](../../README.md#실습-순서) · [다음 문제 · 03 내 시간표](../03-timetable-model/README.md)
