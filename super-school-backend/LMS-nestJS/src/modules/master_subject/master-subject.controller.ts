import { Controller, Get, Post, Body, Param, Patch, Delete, Req, Res, UseGuards, NotFoundException, UseInterceptors, UploadedFile } from "@nestjs/common";
import { MasterSubjectService } from "./master-subject.service";
import { CreateMasterSubjectDto } from "../master_subject/dtos/create-master-subject.dto";
import { UpdateMasterSubjectDto } from "./dtos/update-master-subject.dto";
import { commonResponse } from "helper";
import { Request, Response } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ApiBearerAuth, ApiTags, ApiQuery } from "@nestjs/swagger";
import { Roles } from "src/decorator/role_decorator";
import { RolesGuard } from "../auth/role-auth-guard";
import { ROLE, STORAGE_PATH } from "helper/constants";
import { MultiCreateSubjectDto } from "./dtos/multi-create-master-subject.dto";
import { AuditLogService } from "../audit_log/audit-log.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadService } from "../upload/upload.service";
import * as fs from "fs";
import * as csvParser from "csv-parser";

@Controller("master-subject")
@ApiBearerAuth()
@ApiTags("MasterSubject")
export class MasterSubjectController {
    constructor(private masterSubjectService: MasterSubjectService, private readonly auditLogService: AuditLogService, private uploadService: UploadService) {}

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Post("/create")
    async createMasterSubject(@Body() createMasterSubjectDto: CreateMasterSubjectDto, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const existingSubject = await this.masterSubjectService.findSubjectByName({ subject_code: createMasterSubjectDto.subject_code });
            if (existingSubject) {
                return commonResponse.error(languageCode, res, "SUBJECT_ALREADY_EXISTS", 409, {});
            }

            const newSubject = await this.masterSubjectService.createMasterSubject(createMasterSubjectDto);
            await this.auditLogService.create({
                action: "CREATE",
                message: `SUbject ${newSubject.subject_name} created.`,
                old_data: null,
                new_data: newSubject,
                action_user_id: req.user.userId,
                role_id: req.user.role_id,
            });
            return commonResponse.success(languageCode, res, "SUBJECT_CREATED", 201, newSubject);
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Post("multi/create")
    async multiCreateMasterSubject(@Body() multiCreateSubjectDto: MultiCreateSubjectDto, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            let added = [];
            for (let index = 0; index < multiCreateSubjectDto.subjects.length; index++) {
                const element = multiCreateSubjectDto.subjects[index];
                const existingSubject = await this.masterSubjectService.findSubjectByName({ subject_code: element.subject_code });
                if (!existingSubject) {
                    const newSubject = await this.masterSubjectService.createMasterSubject(element);
                    added.push(newSubject);
                }
            }
            if (added.length > 0) {
                for (const newSubject of added) {
                    await this.auditLogService.create({
                        action: "CREATE",
                        message: `SUbject ${newSubject.subject_name} created.`,
                        old_data: null,
                        new_data: newSubject,
                        role_id: req.user.role_id,

                        action_user_id: req.user.userId,
                    });
                }

                return commonResponse.success(languageCode, res, "SUBJECT_CREATED", 201, added);
            } else {
                return commonResponse.success(languageCode, res, "NO_SUBJECTS_CREATED", 200, []);
            }
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Get("/list")
    @ApiQuery({ name: "sortBy", required: false, type: String, example: "subject_code", description: "SortBy based on key name" })
    @ApiQuery({ name: "sort", required: false, type: String, example: "asc", description: "Sort order (asc/desc)" })
    @ApiQuery({ name: "limit", required: false, type: Number, example: 10, description: "Limit the number of results" })
    @ApiQuery({ name: "page", required: false, type: Number, example: 1, description: "Page number for pagination" })
    @ApiQuery({ name: "search", required: false, type: String, example: "Name", description: "Search by subject code and subject name" })
    @ApiQuery({ name: "is_language", required: false, type: Boolean, example: "true", description: "Search by name" })
    @ApiQuery({ name: "grade_number", required: false, type: Number, example: 8, description: "Filter by grade_number" })
    async getMasterSubjects(@Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const subjects = await this.masterSubjectService.getMasterSubjects(req.query);
            return commonResponse.success(languageCode, res, "SUBJECT_LIST", 200, subjects);
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Get(":id")
    async getMasterSubjectById(@Param("id") id: number, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const subject = await this.masterSubjectService.getMasterSubjectById(id);
            return commonResponse.success(languageCode, res, "SUBJECT_DETAILS", 200, subject);
        } catch (error) {
            if (error instanceof NotFoundException) {
                return commonResponse.error(languageCode, res, "SUBJECT_NOT_FOUND", 404, {});
            }
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Patch("patch/:id")
    async updateMasterSubject(@Param("id") id: number, @Body() updateMasterSubjectDto: UpdateMasterSubjectDto, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const subject = await this.masterSubjectService.getMasterSubjectById(id);
            if (!subject) {
                return commonResponse.error(languageCode, res, "NO_SUBJECTS_FOUND", 404, {});
            }
            const oldGrade = JSON.parse(JSON.stringify(subject));
            const updatedSubject = await this.masterSubjectService.updateMasterSubject(id, updateMasterSubjectDto);
            if (updatedSubject) {
                await this.auditLogService.create({
                    action: "UPDATE",
                    message: `SUbject ${updatedSubject.subject_name} updated.`,
                    old_data: oldGrade,
                    new_data: updatedSubject,
                    action_user_id: req.user.userId,
                    role_id: req.user.role_id,
                });
            }
            return commonResponse.success(languageCode, res, "SUBJECT_UPDATED_SUCCESS", 200, updatedSubject);
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Delete("delete/:id")
    async deleteMasterSubject(@Param("id") id: number, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const exists = await this.masterSubjectService.isExist(id);
            if (!exists) {
                return commonResponse.error(languageCode, res, "NO_SUBJECTS_FOUND", 404, {});
            }
            const oldData = exists ? JSON.parse(JSON.stringify(exists)) : {};
            await this.masterSubjectService.deleteMasterSubject(id);
            const deletedAt = new Date();
            const auditLogData = {
                action: "DELETE",
                message: `SUbject ${exists.subject_name} deleted.`,
                old_data: oldData,
                new_data: null,
                action_user_id: req.user.userId,
                role_id: req.user.role_id,

                deleted_at: deletedAt,
            };
            await this.auditLogService.create(auditLogData);
            return commonResponse.success(languageCode, res, "SUBJECT_DELETED_SUCCESS", 200, {});
        } catch (error) {
            if (error instanceof NotFoundException) {
                return commonResponse.error(languageCode, res, "SUBJECT_NOT_FOUND", 404, {});
            }
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @Post("import-master-subject")
    @UseInterceptors(FileInterceptor("csv_file"))
    async importMasterSubject(@Req() req: any, @Res() res: any, @UploadedFile() csv_file: Express.Multer.File) {
        const languageCode = req.headers["language_code"];
        try {
            if (!csv_file) {
                return commonResponse.error(languageCode, res, "INVALID_FILE", 404, {});
            }

            let uploadedCsv = await this.uploadService.uploadDynamicFiles("csv", csv_file);
            const filePath = `${STORAGE_PATH.PATH}/${uploadedCsv}`;

            const data = await this.parseCSV(filePath);

            if (data?.duplicateRecords?.length) {
                return commonResponse.error(languageCode, res, "DUPLICATE_ENTRIES", 400, {});
            }

            if (!data?.records?.length) {
                return commonResponse.error(languageCode, res, "EMPTY_CSV", 400, {});
            }

            const existingMasterSubjects = await this.masterSubjectService.fetchAllRecords({ deleted_at: null });
            console.log(existingMasterSubjects.length, "=============================");
            const recordsToUpdate = [];
            const recordsToInsert = [];

            // Separate records into those to update and those to insert
            for (const record of data.records) {
                const existingRecord = existingMasterSubjects.find((subject) => String(subject.subject_code) == String(record.subject_code));

                if (existingRecord) {
                    // If the subject_code already exists, update the record
                    recordsToUpdate.push({ id: existingRecord.id, ...record });
                } else {
                    // If the subject_code does not exist, insert the record
                    recordsToInsert.push(record);
                }
            }

            // Update existing records
            if (recordsToUpdate.length) {
                await Promise.all(
                    recordsToUpdate.map(async (record) => {
                        await this.masterSubjectService.updateMasterForImport(record.id, record);
                    })
                );
            }

            // Insert new records
            if (recordsToInsert.length) {
                await this.masterSubjectService.bulkInsertOrUpdate(recordsToInsert);
            }

            return commonResponse.success(languageCode, res, "DATA_IMPORTED_SUCCESSFULLY", 200, {
                updated: recordsToUpdate.length,
                inserted: recordsToInsert.length,
            });
        } catch (error) {
            console.log("🚀 ~ MasterSubjectController ~ importMasterSubject ~ error:", error);
            return commonResponse.error(languageCode, res, "SERVER_ERROR", 500, {});
        }
    }

    private async parseCSV(filePath: string): Promise<{ records: any[]; duplicateRecords: any[] }> {
        const duplicateRecords: any[] = [];
        const seenCodes = new Set();
        const records: any[] = [];

        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(
                    csvParser({
                        mapHeaders: ({ header }) => header.trim(), // Trim headers to avoid whitespace issues
                    })
                )
                .on("data", (row) => {
                    if (seenCodes.has(row.subject_code)) {
                        duplicateRecords.push(row); // Collect duplicates
                    } else {
                        seenCodes.add(row.subject_code); // Add to seen set
                        records.push({
                            grade_number: parseInt(row.grade_number, 10),
                            subject_name: row.subject_name,
                            subject_code: row.subject_code,
                            is_language: row.is_language.toLowerCase() === "true", // Convert to boolean
                            created_at: new Date(),
                        });
                    }
                })
                .on("end", () => resolve({ records, duplicateRecords })) // Return both records and duplicates
                .on("error", (error) => reject(error));
        });
    }
}
