import { ExecutionContext, Injectable, Res, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { Response } from "express";
import { commonResponse } from "helper";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
    constructor() {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const response: Response = context.switchToHttp().getResponse();
        const languageCode = request.headers["language_code"];

        try {
            const result = await super.canActivate(context);
            console.log("🚀 ~ JwtAuthGuard ~ canActivate ~ result:", result);
            return this.isBoolean(result) ? result : false;
        } catch (err) {
            this.handleRequest(err, null, languageCode, context);
            return false;
        }
    }

    handleRequest(err: any, user: any, languageCode: string, context: ExecutionContext): any {
        const response = context.switchToHttp().getResponse<Response>();

        if (err || !user) {
            const errorResponse = this.getErrorResponse(err, user, languageCode, response);
            return response.status(errorResponse.status).json(errorResponse);
        }

        return user;
    }

    private getErrorResponse(err: any, user: any, languageCode: string, response: any) {
        if (err) {
            if (err instanceof TokenExpiredError) {
                return commonResponse.error(languageCode || "en", response, "TOKEN_EXPIRED", 401, {});
            } else if (err instanceof JsonWebTokenError) {
                return commonResponse.error(languageCode || "en", response, "INVALID_TOKEN", 401, {});
            }
        }

        return commonResponse.error(languageCode || "en", response, "AUTHORIZATION_TOKEN_NOT_PROVIDED", 401, {});
    }

    private isBoolean(value: any): value is boolean {
        return typeof value === "boolean";
    }
}
