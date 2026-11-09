import { Injectable, NotImplementedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Credentials, Session } from "@mini-otl/contracts";
import { UserRepository } from "../repository/user.repository";

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly jwt: JwtService,
  ) {}

  async login(_credentials: Credentials): Promise<Session> {
    // TODO(02a): Check the seeded credentials and sign a token with the user ID.
    throw new NotImplementedException("로그인 실습을 진행해 주세요.");
  }
}
