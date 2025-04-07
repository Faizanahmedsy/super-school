import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SchoolSetup } from "./school-setup.entity";
import { SchoolSetupController } from "./school-setup.controller";
import { SchoolSetupService } from "./school-setup.service";
import { JwtStrategy } from "../auth/jwt.strategy";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { InstituteModule } from "../institutes/institutes.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([SchoolSetup]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>("JWT_SECRET"),
                signOptions: { expiresIn: "30d" },
            }),
        }),
        forwardRef(() => InstituteModule),
    ],
    controllers: [SchoolSetupController],
    providers: [JwtStrategy, SchoolSetupService],
    exports: [SchoolSetupService],
})
export class SchoolSetupModule {}
