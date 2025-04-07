import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector, private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.get<string[]>("roles", context.getHandler());
        console.log("🚀 ~ RolesGuard ~ canActivate ~ requiredRoles:", requiredRoles);
        if (!requiredRoles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const token = request.headers.authorization?.split(" ")[1];

        if (!token) {
            throw new UnauthorizedException("Authorization token not provided");
        }

        try {
            const decoded = this.jwtService.decode(token) as { role_name?: string };
            console.log("🚀 ~ RolesGuard ~ canActivate ~ decoded:", decoded);

            if (!decoded || !decoded.role_name) {
                throw new UnauthorizedException("Invalid token or role not found");
            }
            console.log("decoded");
            return requiredRoles.includes(decoded.role_name);
        } catch (error) {
            throw new UnauthorizedException("Token verification failed");
        }
    }
}
