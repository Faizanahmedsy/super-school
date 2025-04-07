import { Controller, Post, UploadedFile, UseInterceptors, Res, Req, Get, Param } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadService } from "./upload.service";
import { Response } from "express";
import { commonResponse } from "helper";
import { ApiExcludeEndpoint } from "@nestjs/swagger";

@Controller("upload")
export class UploadController {
    constructor(private readonly uploadService: UploadService) {}

    @Post("profile")
    @UseInterceptors(FileInterceptor("file"))
    @ApiExcludeEndpoint()
    async uploadProfileImage(@UploadedFile() file: Express.Multer.File, @Req() req, @Res() res: Response) {
        const languageCode = req.headers["language_code"] || "en";
        try {
            const fileUrl = await this.uploadService.uploadFile(file);

            const responseData = { url: fileUrl };

            return commonResponse.success(languageCode, res, "IMAGE_UPLOADED_SUCCESSFULLY", 200, responseData);
        } catch (error) {
            console.error("Error uploading file:", error);
            return commonResponse.error(languageCode, res, "IMAGE_UPLOAD_FAILED", 400, { message: error.message });
        }
    }
}
