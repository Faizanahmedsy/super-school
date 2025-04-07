import { CallHandler, ExecutionContext, Injectable, NestInterceptor, HttpStatus } from "@nestjs/common";
import { Observable, map } from "rxjs";

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    private static getMessageCode(statusCode: number): string {
        return HttpStatus[statusCode] || "UNKNOWN_ERROR";
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((data) => {
                const statusCode = data?.statusCode || HttpStatus.OK;
                const messageCode = ResponseInterceptor.getMessageCode(statusCode);

                const hasMessage = data && typeof data.message === "string";
                const response = {
                    error: false,
                    message: hasMessage ? data.message : null,
                    statusCode: statusCode,
                    messageCode: messageCode,
                    data: data?.data || data || null,
                };

                return response;
            })
        );
    }
}
