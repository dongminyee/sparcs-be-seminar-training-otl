import { Controller, NotImplementedException, Post } from "@nestjs/common";

@Controller("auth")
export class AuthController {
  @Post("login")
  login() {
    // TODO(2): Validate credentials against the seeded user and issue a JWT.
    throw new NotImplementedException("로그인 실습을 진행해 주세요.");
  }
}
