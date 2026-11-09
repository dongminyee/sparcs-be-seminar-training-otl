import { ConfigService } from "@mini-otl/env";
import { Injectable, NotImplementedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

export type AuthenticatedUser = { id: number };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow<string>("JWT_SECRET"),
      algorithms: ["HS256"],
    });
  }

  validate(_payload: { sub?: unknown }): AuthenticatedUser {
    // TODO(02b): Validate the subject and return the user for request.user.
    throw new NotImplementedException("JWT 사용자 확인을 구현해 주세요.");
  }
}
