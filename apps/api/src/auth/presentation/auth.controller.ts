import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
} from "@nestjs/common";
import type { Credentials } from "@mini-otl/contracts";
import { AuthService } from "../service/auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  // TODO(02b): Add GET /api/auth/me protected by JwtAuthGuard.
  @Post("login")
  @HttpCode(200)
  login(@Body() body?: Partial<Credentials>) {
    const username =
      typeof body?.username === "string" ? body.username.trim() : "";
    const password = body?.password;
    if (
      !username ||
      username.length > 32 ||
      typeof password !== "string" ||
      !password ||
      Buffer.byteLength(password) > 72
    ) {
      throw new BadRequestException("아이디와 비밀번호를 입력해 주세요.");
    }
    return this.auth.login({ username, password });
  }
}
