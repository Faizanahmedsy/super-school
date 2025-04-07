import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GeneralSettingController } from "./general-setting.controller";
import { GeneralSettingService } from "./general-setting.service";
import { Institute } from "../institutes/institutes.entity";
import { AuthModule } from "../auth/auth.module";
import { JwtService } from "@nestjs/jwt";
import { UploadService } from "../upload/upload.service";
import { GeneralSetting } from "./general-setting.entity";
@Module({
    imports: [TypeOrmModule.forFeature([Institute, GeneralSetting]), AuthModule],
    controllers: [GeneralSettingController],
    providers: [GeneralSettingService, JwtService, UploadService],
    exports: [GeneralSettingService, TypeOrmModule],
})
export class GeneralSettingModule {}
