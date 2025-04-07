import { Injectable, NestMiddleware, BadRequestException } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { commonResponse } from "helper";

@Injectable()
export class LanguageMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const languageCode = req.headers["language_code"];

        if (!languageCode) {
            return commonResponse.error("en", res, "LANGUAGE_CODE_REQUIRED", 500, {});
        }

        next();
    }
}
