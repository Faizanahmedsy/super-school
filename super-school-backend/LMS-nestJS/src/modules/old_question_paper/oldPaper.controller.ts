import { Controller, Get, Post, Body, Param, Patch, Delete, Req, Res, UseGuards, UseInterceptors, UploadedFile, ParseIntPipe } from "@nestjs/common";
import { OldQuestionPaperService } from "./oldPaper.service";
import { CreateOldQuestionPaperDto } from "../old_question_paper/dtos/create-old-question-paper.dto";
import { UpdateOldQuestionPaperDto } from "../old_question_paper/dtos/update-old-question-paper.dto";
import { commonResponse } from "helper";
import { Request, Response } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/role-auth-guard";
import { ApiBearerAuth, ApiTags, ApiConsumes, ApiBody } from "@nestjs/swagger";
import { Roles } from "src/decorator/role_decorator";
import { ROLE } from "helper/constants";
import { FileInterceptor } from "@nestjs/platform-express";

import { join } from "path";
import * as fs from "fs";
import * as path from "path";
import { AuditLogService } from "../audit_log/audit-log.service";

function ensureDirectoryExistence(filePath: string, file: any) {
    const dirname = join(__dirname, "../../../", filePath);

    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, { recursive: true });
    }

    const fullFilePath = join(dirname, file.originalname);

    fs.writeFileSync(fullFilePath, file.buffer);
    return fullFilePath;
}

function updatePdfFile(filePath: string, file: Express.Multer.File, oldFilePath: string | undefined): string {
    const dirname = join(__dirname, "../../../", filePath);

    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, { recursive: true });
    }

    if (oldFilePath && fs.existsSync(oldFilePath)) {
        try {
            fs.unlinkSync(oldFilePath);
        } catch (err) {
            console.error("Error deleting old file:", err);
        }
    } else {
        console.log("Old file does not exist, skipping deletion.");
    }

    const fullFilePath = join(dirname, file.originalname);

    fs.writeFileSync(fullFilePath, file.buffer);

    return fullFilePath;
}

@Controller("old-question-papers")
@ApiBearerAuth()
@ApiTags("Old Question Papers")
export class OldQuestionPaperController {
    constructor(private oldQuestionPaperService: OldQuestionPaperService, private auditLogService: AuditLogService) {}

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Post("upload")
    @UseInterceptors(FileInterceptor("file"))
    @ApiConsumes("multipart/form-data")
    async uploadOldQuestionPaper(
        @UploadedFile() file: Express.Multer.File,
        @Body() createOldQuestionPaperDto: CreateOldQuestionPaperDto,
        @Req() req: Request,
        @Res() res: Response
    ) {
        const languageCode = req.headers["language_code"] || "en";
        try {
            const { batch_id, grade_id } = createOldQuestionPaperDto;

            if (!batch_id || !grade_id) {
                return commonResponse.error(languageCode, res, "MISSING_BATCH_OR_GRADE_ID", 400, {});
            }

            const result: any = await this.oldQuestionPaperService.getGradeAndBatchInfo(grade_id, batch_id);

            if (!result) {
                return commonResponse.error(languageCode, res, "GRADE_OR_BATCH_NOT_FOUND", 400, {});
            }

            const { grade_number } = result;

            if (!grade_number) {
                return commonResponse.error(languageCode, res, "INVALID_GRADE_OR_BATCH_INFO", 400, {});
            }

            if (!file) {
                return commonResponse.error(languageCode, res, "INVALID_FILE_TYPE", 400, {});
            }

            const uploadPath = join("uploads", "questionPapers", grade_number);
            const filePath = ensureDirectoryExistence(uploadPath, file);

            const newPaper = await this.oldQuestionPaperService.create(createOldQuestionPaperDto, filePath);

            if (!newPaper) {
                return commonResponse.error(languageCode, res, "FAILED_TO_SAVE_DATABASE", 500, {});
            }

            await this.auditLogService.create({
                action: "CREATE",
                message: `Old Paper ${newPaper.paper_name} created.`,
                old_data: null,
                new_data: newPaper,
                action_user_id: req.user.userId,
                role_id: req.user.role_id,

                school_id: newPaper.school_id,
            });

            return commonResponse.success(languageCode, res, "PAPER_CREATED_SUCCESS", 201, {
                file: file.filename,
            });
        } catch (error) {
            console.error("Error uploading old question paper:", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {
                error: error.message || error,
            });
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Get("/list")
    async getAllOldQuestionPapers(@Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const papers = await this.oldQuestionPaperService.findAll();

            if (papers && papers.length > 0) {
                return commonResponse.success(languageCode, res, "PAPER_LIST_FOUND", 200, papers);
            } else {
                return commonResponse.error(languageCode, res, "PAPER_LIST_NOT_FOUND", 404, {});
            }
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Get(":id")
    async getOldQuestionPaperById(@Param("id", ParseIntPipe) id: number, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const paper = await this.oldQuestionPaperService.findOne(id);
            if (paper) {
                return commonResponse.success(languageCode, res, "PAPER_FOUND", 200, paper);
            } else {
                return commonResponse.error(languageCode, res, "PAPER_NOT_FOUND", 404, {});
            }
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Patch("patch/:id")
    @UseInterceptors(FileInterceptor("file"))
    @ApiConsumes("multipart/form-data")
    async updateOldQuestionPaper(
        @Param("id", ParseIntPipe) id: number,
        @UploadedFile() file: Express.Multer.File,
        @Body() updateOldQuestionPaperDto: UpdateOldQuestionPaperDto,
        @Req() req: Request,
        @Res() res: Response
    ) {
        const languageCode = req.headers["language_code"];
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return commonResponse.error(languageCode, res, "USER_NOT_AUTHORIZED", 401, {});
            }

            const { batch_id, grade_id } = updateOldQuestionPaperDto;

            if (!batch_id || !grade_id) {
                return commonResponse.success(languageCode, res, "MISSING_BATCH_OR_GRADE_ID", 400, {});
            }

            const result = await this.oldQuestionPaperService.getGradeAndBatchInfo(grade_id, batch_id);
            if (!result) {
                return commonResponse.success(languageCode, res, "GRADE_OR_BATCH_NOT_FOUND", 400, {});
            }

            const { grade_number, start_year } = result;
            if (!grade_number || !start_year) {
                return commonResponse.success(languageCode, res, "INVALID_GRADE_OR_BATCH_INFO", 400, {});
            }

            const uploadPath = join("uploads", "questionPapers", start_year.toString(), grade_number);

            const oldFile = await this.oldQuestionPaperService.findOne(id);

            const oldFilePath = oldFile ? oldFile.paper_path : undefined;

            if (oldFilePath) {
                if (fs.existsSync(oldFilePath)) {
                    try {
                        fs.unlinkSync(oldFilePath);
                    } catch (err) {
                        console.error("Error deleting old file:", err);
                    }
                } else {
                    console.log("Old file does not exist:", oldFilePath);
                }
            }

            const filePath = updatePdfFile(uploadPath, file, oldFilePath);

            let updatedData = { ...updateOldQuestionPaperDto, updated_by: userId };

            if (file) {
                updatedData.paper_path = filePath;
            }
            let oldBatch = { ...oldFile };
            const updatedPaper = await this.oldQuestionPaperService.update(id, updatedData);
            await this.auditLogService.create({
                action: "UPDATE",
                message: `Old Paper ${updatedPaper.paper_name} updated.`,
                old_data: oldBatch,
                new_data: updatedPaper,
                action_user_id: req.user.userId,
                role_id: req.user.role_id,

                school_id: updatedPaper.school_id,
            });

            return commonResponse.success(languageCode, res, "PAPER_UPDATED_SUCCESSFULLY", 200, {
                updatedPaper,
                file: file ? file.filename : null,
            });
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Delete(":id")
    async deleteOldQuestionPaper(@Param("id", ParseIntPipe) id: number, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const EventExists = await this.oldQuestionPaperService.findOne(id);

            if (!EventExists) {
                return commonResponse.success(languageCode, res, "PAPER_NOT_FOUND", 400, {});
            }
            let oldData = { ...EventExists };

            await this.oldQuestionPaperService.softDelete(id);
            const deletedAt = new Date().toISOString();
            const auditLogData = {
                action: "DELETE",
                message: `Old Paper ${EventExists.paper_name} deleted.`,
                old_data: oldData,
                new_data: null,
                action_user_id: req.user.userId,
                role_id: req.user.role_id,

                school_id: EventExists.school_id,
                deleted_at: deletedAt,
            };

            await this.auditLogService.create(auditLogData);

            return commonResponse.success(languageCode, res, "OLD_QUESTION_PAPER_DELETED_SUCCESS", 200, {});
        } catch (error) {
            console.error("Error deleting old question paper:", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }
}
