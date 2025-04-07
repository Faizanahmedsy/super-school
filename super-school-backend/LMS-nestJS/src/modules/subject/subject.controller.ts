import { Controller, Get, Post, Body, Param, Patch, Delete, Req, Res, UseGuards, Query } from "@nestjs/common";
import { SubjectService } from "./subject.service";
import { CreateSubjectDto } from "./dtos/create-subject.dto";
import { UpdateSubjectDto } from "./dtos/update-subject.dto";
import { commonResponse } from "helper";
import { Request, Response } from "express";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "src/decorator/role_decorator";
import { ROLE } from "helper/constants";
import { GetSubjectsQueryDto } from "./dtos/get-subjects-query.dto";
import { MultiCreateSubjectsDto } from "./dtos/multi-create-subject.dto";
import { AuditLogService } from "../audit_log/audit-log.service";
import { TeacherService } from "../teacher/teacher.service";
@Controller("subject")
@ApiBearerAuth()
@ApiTags("Subject")
export class SubjectController {
    constructor(private subjectService: SubjectService, private readonly auditLogService: AuditLogService, private readonly teacherService: TeacherService) {}

    private handleResponse(languageCode: string, res: Response, messageKey: string, status: number, data: any) {
        if (status >= 400) {
            return commonResponse.error(languageCode, res, messageKey, status, {});
        }
        return commonResponse.success(languageCode, res, messageKey, status, data);
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Post("/create")
    async createSubject(@Body() createSubjectDto: CreateSubjectDto, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            if (!req.user || !req.user.userId) {
                return commonResponse.error(languageCode, res, "USER_NOT_AUTHORIZED", 401, {});
            }
            if (req.user.institute_id) {
                createSubjectDto["school_id"] = req.user.institute_id;
            } else {
                if (!createSubjectDto.school_id) {
                    return commonResponse.error(languageCode, res, "SCHOOL_REQUIRED", 409, {});
                }
            }

            createSubjectDto["created_by"] = Number(req.user.userId);
            const exists = await this.subjectService.isExist({
                grade_id: createSubjectDto.grade_id,
                school_id: createSubjectDto.school_id,
                master_subject_id: createSubjectDto.master_subject_id,
                // term_id: createSubjectDto.term_id,
                batch_id: createSubjectDto.batch_id,
            });
            if (exists) {
                return commonResponse.error(languageCode, res, "SUBJECT_ALREADY_EXISTS", 409, {});
            }

            const newSubject = await this.subjectService.createSubject(createSubjectDto);
            await this.auditLogService.create({
                action: "CREATE",
                message: `Subject Created.`,
                old_data: null,
                new_data: newSubject,
                action_user_id: req.user.userId,

                school_id: newSubject.school_id,
            });
            return commonResponse.success(languageCode, res, "SUBJECT_CREATED", 201, newSubject);
        } catch (error) {
            console.error("Error in createSubject:", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Post("multi/create")
    async multiCreateSubject(@Body() multiCreateSubjectDto: MultiCreateSubjectsDto, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            if (!req.user || !req.user.userId) {
                return commonResponse.error(languageCode, res, "USER_NOT_AUTHORIZED", 401, {});
            }
            let added = [];
            for (let index = 0; index < multiCreateSubjectDto.subjects.length; index++) {
                const element = multiCreateSubjectDto.subjects[index];
                const existingSubject = await this.subjectService.isExist({
                    grade_id: element.grade_id,
                    school_id: element.school_id,
                    master_subject_id: element.master_subject_id,
                    // term_id: element.term_id,
                    batch_id: element.batch_id,
                });

                if (!existingSubject) {
                    element["created_by"] = Number(req.user.userId);
                    const newSubject = await this.subjectService.createSubject(element);
                    added.push(newSubject);
                }
            }
            console.log("subjects===============", added);
            if (added.length > 0) {
                // for (const newSubject of added) {
                //     await this.auditLogService.create({
                //         action: "CREATE",
                //         message: `Subject ${newSubject.term_id} created.`,
                //         old_data: null,
                //         new_data: newSubject,
                //         action_user_id: req.user.userId,
                //     });
                // }

                return commonResponse.success(languageCode, res, "SUBJECT_CREATED", 201, added);
            } else {
                return commonResponse.error(languageCode, res, "NO_NEW_SUBJECTS_CREATED", 409, {});
            }
        } catch (error) {
            console.error("Error in multiCreateSubject:", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Get("/list")
    @ApiQuery({ name: "sort", required: false, type: String, example: "asc" })
    @ApiQuery({ name: "limit", required: false, type: Number, example: 10 })
    @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
    @ApiQuery({ name: "school_id", required: false, type: Number, example: 1 })
    @ApiQuery({ name: "grade_id", required: false, type: Number, example: 1 })
    // @ApiQuery({ name: "term_id", required: false, type: Number, example: 1 })
    @ApiQuery({ name: "batch_id", required: false, type: Number, example: 1 })
    @ApiQuery({ name: "master_subject_id", required: false, type: Number, example: 1 })
    @ApiQuery({ name: "student_count", required: false, type: Boolean, example: true })
    @ApiQuery({ name: "checkStudent", required: false, type: Boolean, example: true, description: "Student count based filter" })
    async getSubjects(@Req() req: Request, @Res() res: Response, @Query() query: GetSubjectsQueryDto) {
        if (req.user.institute_id) {
            query["school_id"] = req.user.institute_id;
        }
        const languageCode = req.headers["language_code"];
        try {
            console.log("req.user======", req.user);
            if (req.user.role_name == "teacher") {
                let teacherId = await this.teacherService.getTeacherByObj({ teacher_user_id: req.user.userId });

                if (!teacherId) {
                    return commonResponse.error(languageCode, res, "TEACHER_NOT_FOUND", 400, {});
                } else {
                    // console.log("🚀 ~ file: grade.controller.ts:159 ~ GradeController ~ getGrades ~ teacherId:", teacherId);
                    query["teacher_id"] = teacherId.id;
                }
            }
            console.log("🚀 ~ file: subject.controller.ts:153 ~ SubjectController ~ getSubjects ~ query:", query);
            const subjects = await this.subjectService.getSubjects(query);

            return commonResponse.error(languageCode, res, subjects ? "SUBJECT_LIST" : "NO_SUBJECTS_FOUND", subjects ? 200 : 404, subjects);
        } catch (error) {
            console.error("Error fetching subject data:", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Get(":id")
    async getSubjectById(@Param("id") id: number, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const subject = await this.subjectService.getSubjectById(id);
            return commonResponse.error(languageCode, res, "FETCHED_SUBJECT_DETAILS", 200, subject);
        } catch (error) {
            console.error("Error fetching subject by ID:", error);
            return commonResponse.error(languageCode, res, "NO_SUBJECTS_FOUND", 404, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Patch("patch/:id")
    async updateSubject(@Param("id") id: number, @Body() updateSubjectDto: UpdateSubjectDto, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const subject = await this.subjectService.getSubjectById(id);
            if (!subject) {
                return commonResponse.error(languageCode, res, "NO_SUBJECTS_FOUND", 404, {});
            }
            const oldGrade = JSON.parse(JSON.stringify(subject));
            updateSubjectDto["updated_by"] = req.user.userId;
            const updatedSubject = await this.subjectService.updateSubject(id, updateSubjectDto);
            if (updatedSubject) {
                await this.auditLogService.create({
                    action: "UPDATE",
                    message: `Subject  Updated.`,
                    old_data: oldGrade,
                    new_data: updatedSubject,
                    action_user_id: req.user.userId,

                    school_id: updatedSubject.school_id,
                });
            }
            return commonResponse.success(languageCode, res, "SUBJECT_UPDATED_SUCCESS", 200, updatedSubject);
        } catch (error) {
            console.error("Error updating subject:", error);
            const messageKey = error.code === "SUBJECT_UPDATE_FAILED" ? "SUBJECT_UPDATE_FAILED" : "DEFAULT_INTERNAL_SERVER_ERROR";
            return commonResponse.error(languageCode, res, messageKey, 400, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Delete("delete/:id")
    async deleteSubject(@Param("id") id: number, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const exists = await this.subjectService.isExist1(id);
            if (!exists) {
                return commonResponse.error(languageCode, res, "NO_SUBJECTS_FOUND", 404, {});
            }

            let isExistDivisionSubject = await this.subjectService.fetchDivisionSubjectByQuery({
                school_id: exists.school_id,
                batch_id: exists.batch_id,
                grade_id: exists.grade_id,
                master_subject_id: exists.master_subject_id,
                subject_id: exists.id,
            });

            if (isExistDivisionSubject?.length) {
                return commonResponse.error(languageCode, res, "YOU_CANNOT_DELETE_THIS_SUBJECT", 400, {});
            }

            const oldData = exists ? JSON.parse(JSON.stringify(exists)) : {};

            exists["deleted_at"] = new Date();
            exists["deleted_by"] = req.user.userId;

            await this.subjectService.softDeleteSubject(exists);

            const deletedAt = new Date();
            const auditLogData = {
                action: "DELETE",
                message: `Subject Deleted.`,
                old_data: oldData,
                new_data: null,
                action_user_id: req.user.userId,

                school_id: exists.school_id,
                deleted_at: deletedAt,
            };
            await this.auditLogService.create(auditLogData);
            return commonResponse.success(languageCode, res, "SUBJECT_DELETED_SUCCESS", 200, {});
        } catch (error) {
            console.error("Error deleting subject:", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }
}
