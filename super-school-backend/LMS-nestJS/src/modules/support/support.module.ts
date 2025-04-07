import { forwardRef, Module } from "@nestjs/common";
import { UsersModule } from "../users/user.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Support } from "./support.entity";
import { AuthModule } from "../auth/auth.module";
import { JwtService } from "@nestjs/jwt";
import { SupportController } from "./support.controller";
import { SupportService } from "./support.service";
import { UploadService } from "../upload/upload.service";
import { InstituteModule } from "../institutes/institutes.module";
import { GeneralSettingModule } from "../general_setting/general-setting.module";
import { EmailService } from "src/services/mail.service";
import { OBSFileService } from "src/services/obs-file.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([Support]),
        forwardRef(() => UsersModule),
        forwardRef(() => AuthModule),
        forwardRef(() => InstituteModule),
        forwardRef(() => GeneralSettingModule),
    ],
    controllers: [SupportController],
    providers: [SupportService, JwtService, UploadService, EmailService, OBSFileService],
})
export class SupportModule {}
