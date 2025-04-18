import { Module } from "@nestjs/common";
import { UploadService } from "./upload.service";
import { UploadController } from "./upload.controller";
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true })],
    providers: [UploadService],
    controllers: [UploadController],
    exports: [UploadService],
})
export class UploadModule {}
