import { Strategy, ExtractJwt } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { jwtConstants } from "./constants";
import { ConfigService } from "@nestjs/config";

interface JwtPayload {
    sub: number;
    email: string;
    role_name: string;
    role_id: number;
    institute_id: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>("JWT_SECRET"),
        });
    }

    async validate(payload: JwtPayload) {
        return { userId: payload.sub, email: payload.email, role_name: payload.role_name, role_id: payload.role_id, institute_id: payload.institute_id };
    }
}
