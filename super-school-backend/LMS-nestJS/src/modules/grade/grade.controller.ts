import { Controller, Get, Post, Body, Param, Patch, Req, Res, Delete, Query, UseGuards } from "@nestjs/common";
import { GradeService } from "./grade.service";
import { commonResponse } from "helper";
import { CreateGradeDto } from "./dtos/create-grade.dto";
import { UpdateGradeDto } from "./dtos/update-grade.dto";
import { Grade } from "./grade.entity";
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/decorator/role_decorator";
import { ROLE } from "helper/constants";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { commonFunctions } from "helper";
import { DivisionService } from "../division/division.service";
import { name } from "ejs";
import { MultiCreateGradeDto } from "./dtos/multi-create-grade.dto";
import { AuditLogService } from "../audit_log/audit-log.service";
import { TeacherService } from "../teacher/teacher.service";
import { MultiCreateGradeDtoForSetupWizard } from "./dtos/manage-grade-setup-wizard";
import { In } from "typeorm";
import { SubjectService } from "../subject/subject.service";
import { TimeTableService } from "../time_table/time_table.service";
import { EventService } from "../calendar_event/event.service";
@Controller("grade")
@ApiBearerAuth()
@ApiTags("Grade")
export class GradeController {
    constructor(
        private gradeService: GradeService,
        private divisionService: DivisionService,
        private readonly auditLogService: AuditLogService,
        private readonly teacherService: TeacherService,
        private readonly subjectService: SubjectService,
        private readonly timetableService: TimeTableService,
        private readonly eventService: EventService
    ) {}

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Post("/create")
    async createGrade(@Body() createGradeDto: CreateGradeDto, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            if (req.user.institute_id) {
                createGradeDto["school_id"] = req.user.institute_id;
            } else {
                if (!createGradeDto.school_id) {
                    return commonResponse.error(languageCode, res, "SCHOOL_REQUIRED", 409, {});
                }
            }
            let checkExist = await this.gradeService.isExist({
                grade_number: createGradeDto.grade_number,
                school_id: createGradeDto.school_id,
                batch_id: createGradeDto.batch_id,
            });

            if (checkExist) {
                return commonResponse.error(languageCode, res, "GRADE_ALREADY_EXISTS", 400, {});
            }
            createGradeDto["created_by"] = req.user.userId;
            let create = await this.gradeService.createGrade(createGradeDto);
            if (create) {
                let divisionPayload = {
                    grade_id: create?.id,
                    school_id: create?.school_id,
                    name: "A",
                    subject_id: null,
                    created_by: req.user.userId,
                    updated_by: req.user.userId,
                    deleted_by: null,
                    batch_id: create.batch_id,
                };
                await this.divisionService.createDivision(divisionPayload);
                await this.auditLogService.create({
                    action: "CREATE",
                    message: `Grade ${create.grade_number} created.`,
                    old_data: null,
                    new_data: create,
                    action_user_id: req.user.userId,
                    role_id: req.user.role_id,

                    school_id: create.school_id,
                });
                return commonResponse.success(languageCode, res, "GRADE_CREATED", 200, create);
            } else {
                return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
            }
        } catch (error) {
            console.error("Error creating grade:", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Post("/multi/create")
    async multiCreate(@Body() multiCreateGradeDto: MultiCreateGradeDto, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            let added = [];
            if (req.user.institute_id) {
                multiCreateGradeDto["school_id"] = req.user.institute_id;
            } else {
                if (!multiCreateGradeDto.school_id) {
                    return commonResponse.error(languageCode, res, "SCHOOL_REQUIRED", 409, {});
                }
            }
            for (let index = 0; index < multiCreateGradeDto.grads.length; index++) {
                let element: any = multiCreateGradeDto.grads[index];
                let checkExist = await this.gradeService.isExist({
                    grade_number: element.grade_number,
                    school_id: multiCreateGradeDto.school_id,
                    batch_id: element.batch_id,
                });
                if (!checkExist) {
                    element["created_by"] = req.user.userId;
                    element["school_id"] = multiCreateGradeDto.school_id;

                    let create = await this.gradeService.createGrade(element);
                    if (create) {
                        added.push(create);
                    }
                }
            }
            if (added.length > 0) {
                const gradeNumbers = added.map((grade) => grade.grade_number).join(", ");

                await this.auditLogService.create({
                    action: "CREATE",
                    message: `Grades ${gradeNumbers} created.`,
                    old_data: null,
                    new_data: added,
                    role_id: req.user.role_id,

                    action_user_id: req.user.userId,
                });
                return commonResponse.success(languageCode, res, "GRADE_CREATED", 200, added);
            } else {
                return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
            }
        } catch (error) {
            console.error("Error creating grade:", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }
    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Get("/list")
    @ApiQuery({ name: "sort", required: false, type: String, example: "asc", description: "Sort order (asc/desc)" })
    @ApiQuery({ name: "limit", required: false, type: Number, example: 10, description: "Limit the number of results" })
    @ApiQuery({ name: "page", required: false, type: Number, example: 1, description: "Page number for pagination" })
    @ApiQuery({ name: "search", required: false, type: String, example: "Name", description: "Search by name" })
    @ApiQuery({ name: "school_id", required: false, type: Number, example: 1, description: "Filter by school_id" })
    @ApiQuery({ name: "batch_id", required: false, type: Number, example: 1, description: "Filter by batch_id" })
    @ApiQuery({ name: "checkStudent", required: false, type: Boolean, example: true, description: "Student count based filter" })
    async getGrades(@Req() req, @Res() res, @Query() query: any) {
        const languageCode = req.headers["language_code"];
        try {
            console.log("🚀 ~ file: grade.controller.ts:145 ~ GradeController ~ getGrades ~ req.user:", req.user);
            if (req.user.institute_id) {
                query["school_id"] = req.user.institute_id;
            }

            if (req.user.role_name == "teacher") {
                let teacherId = await this.teacherService.getTeacherByObj({ teacher_user_id: req.user.userId });

                if (!teacherId) {
                    return commonResponse.error(languageCode, res, "TEACHER_NOT_FOUND", 400, {});
                } else {
                    console.log("🚀 ~ file: grade.controller.ts:159 ~ GradeController ~ getGrades ~ teacherId:", teacherId);
                    query["teacher_id"] = teacherId.id;
                }
            }
            let list = await this.gradeService.getGrades(query);

            if (list) {
                return commonResponse.success(languageCode, res, "GRADE_LIST", 200, list);
            } else {
                return commonResponse.error(languageCode, res, "GRADE_LIST_ERROR", 400, {});
            }
        } catch (error) {
            console.error("Error fetching grades:", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Get(":id")
    @ApiParam({ name: "id", required: true, type: Number, example: 1, description: "Grade ID" })
    async getGradeById(@Param("id") id: number, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            let gradeDetails = await this.gradeService.getGradeById(id);
            if (gradeDetails) {
                return commonResponse.success(languageCode, res, "GRADE_DETAILS", 200, gradeDetails);
            } else {
                return commonResponse.error(languageCode, res, "GRADE_NOT_FOUND", 400, {});
            }
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION, ROLE.TEACHER)
    @Patch("patch/:id")
    @ApiParam({ name: "id", required: true, type: Number, example: 1, description: "Grade ID" })
    async updateGrade(@Param("id") id: number, @Body() updateGradeDto: UpdateGradeDto, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            updateGradeDto["updated_by"] = req.user.userId;

            const grade = await this.gradeService.getGradeById(id);
            if (!grade) {
                return commonResponse.error(languageCode, res, "GRADE_NOT_FOUND", 400, {});
            }

            const oldGrade = JSON.parse(JSON.stringify(grade));

            const updateGrade = await this.gradeService.updateGrade(id, updateGradeDto);
            if (updateGrade) {
                await this.auditLogService.create({
                    action: "UPDATE",
                    message: `Grade ${updateGrade.grade_number} updated.`,
                    old_data: oldGrade,
                    new_data: updateGrade,
                    action_user_id: req.user.userId,
                    school_id: updateGrade.school_id,
                    role_id: req.user.role_id,
                });

                return commonResponse.success(languageCode, res, "GRADE_UPDATED_SUCCESS", 200, updateGrade);
            } else {
                return commonResponse.error(languageCode, res, "GRADE_UPDATE_ERROR", 400, {});
            }
        } catch (error) {
            console.error("Error updating grade:", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION, ROLE.TEACHER)
    @Delete("delete/:id")
    @ApiParam({ name: "id", required: true, type: Number, example: 1, description: "Grade ID" })
    async deleteGrade(@Param("id") id: number, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            const checkExist = await this.gradeService.isExist1(id); // Pass id directly

            if (!checkExist) {
                return commonResponse.error(languageCode, res, "GRADE_NOT_FOUND", 404, {});
            }

            // CHECK FOR STUDENT:
            let isExistStudent = await this.divisionService.isExistStudent({
                school_id: checkExist.school_id,
                grade_id: checkExist.id,
                cur_batch_id: checkExist.batch_id,
            });

            // // check for division subject entries for this CLASS
            let isExistDivisionSubject = await this.divisionService.isExistCheckWithQuery({
                school_id: checkExist.school_id,
                grade_id: checkExist.id,
                batch_id: checkExist.batch_id,
            });

            if (isExistDivisionSubject || isExistStudent) {
                return commonResponse.error(languageCode, res, "YOU_CANNOT_DELETE_THIS_GRADE", 400, {});
            }

            let gradeAssociatedClass = await this.divisionService.getMultiDivisionByQuery({
                school_id: checkExist.school_id,
                grade_id: checkExist.id,
                batch_id: checkExist.batch_id,
            });

            let isExistGradeSubject = await this.subjectService.getSubjectByQuery({
                school_id: checkExist.school_id,
                grade_id: checkExist.id,
                batch_id: checkExist.batch_id,
            });

            if (gradeAssociatedClass?.length) {
                gradeAssociatedClass = gradeAssociatedClass.map((data) => {
                    data["deleted_at"] = new Date();
                    data["deleted_by"] = req.user.userId;
                    return data;
                });
                await this.divisionService.bulkUpdate(gradeAssociatedClass);
            }

            let isExistTimeTable = await this.timetableService.getTimeTableByQuery({
                school_id: checkExist.school_id,
                grade_id: checkExist.id,
                batch_id: checkExist.batch_id,
            });

            let isExistEvent = await this.eventService.getEventByQuery({
                school_id: checkExist.school_id,
                grade_id: checkExist.id,
                // batch_id: checkExist.batch_id,
            });

            if (isExistGradeSubject?.length) {
                // delete all subjects
                isExistGradeSubject = isExistGradeSubject.map((data) => {
                    data["deleted_at"] = new Date();
                    data["deleted_by"] = req.user.userId;
                    return data;
                });
                await this.subjectService.bulkUpdate(isExistGradeSubject);
            }

            if (isExistTimeTable?.length) {
                // delete all timetable
                isExistTimeTable = isExistTimeTable.map((data) => {
                    data["deleted_at"] = new Date();
                    data["deleted_by"] = req.user.userId;
                    return data;
                });
                await this.timetableService.bulkUpdate(isExistTimeTable);
            }

            if (isExistEvent) {
                isExistEvent = isExistEvent.map((data) => {
                    data["deleted_at"] = new Date();
                    data["deleted_by"] = req.user.userId;
                    return data;
                });
                await this.eventService.bulkUpdate(isExistEvent);
            }
            const oldData = checkExist ? JSON.parse(JSON.stringify(checkExist)) : {};

            checkExist["deleted_at"] = new Date();
            checkExist["deleted_by"] = req.user.userId;
            await this.gradeService.deleteGrade(checkExist);
            const deletedAt = new Date();
            const auditLogData = {
                action: "DELETE",
                message: `Grade ${checkExist.grade_number} deleted.`,
                old_data: oldData,
                new_data: null,
                action_user_id: req.user.userId,
                school_id: checkExist.school_id,
                role_id: req.user.role_id,

                deleted_at: deletedAt,
            };
            await this.auditLogService.create(auditLogData);
            return commonResponse.success(languageCode, res, "GRADE_DELETED_SUCCESS", 200, {});
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Patch("/create-for-setup-wizard")
    async multiCreateForWizardSetup(@Body() body: MultiCreateGradeDtoForSetupWizard, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            if (req.user.institute_id) {
                body["school_id"] = req.user.institute_id;
            } else {
                if (!body.school_id) {
                    return commonResponse.error(languageCode, res, "SCHOOL_REQUIRED", 409, {});
                }
            }

            let fetchAllGrade = await this.gradeService.geGradeByQuery({ school_id: body.school_id, batch_id: body.batch_id });

            let existGrade = fetchAllGrade.map((data) => data.grade_number);
            let newGrade = body.grads.map((data) => data.grade_number);

            let removedGrades = existGrade.filter((grade) => !newGrade.includes(grade));
            let addedGrades = newGrade.filter((grade) => !existGrade.includes(grade));

            if (removedGrades?.length) {
                let deleteGradeIds = [];
                for (let grade of removedGrades) {
                    let isExist = fetchAllGrade.find((d) => String(d.grade_number) == String(grade));
                    if (isExist) {
                        deleteGradeIds.push(isExist.id);
                    }
                }
                if (deleteGradeIds?.length) {
                    let fetchAllDivision = await this.divisionService.getMultiDivisionByQuery({
                        grade_id: In(deleteGradeIds),
                        school_id: body.school_id,
                        batch_id: body.batch_id,
                    });
                    if (fetchAllDivision?.length) {
                        let divisionIds = fetchAllDivision.map((data) => data.id);
                        await this.divisionService.hardDeleteDivision(divisionIds);
                    }
                    await this.gradeService.hardDeleteGrade(deleteGradeIds);
                }
            }
            if (addedGrades?.length) {
                let saveGrade = [];
                for (let grade of addedGrades) {
                    let isExist = body.grads.find((d) => String(d.grade_number) == String(grade));
                    if (isExist) {
                        isExist["batch_id"] = body.batch_id;
                        isExist["created_by"] = req.user.userId;
                        isExist["school_id"] = body.school_id;
                        saveGrade.push(isExist);
                    }
                }

                if (saveGrade?.length) {
                    await this.gradeService.createBulk(saveGrade);
                }
            }
            let storeGrade = await this.gradeService.geGradeByQuery({ school_id: body.school_id, batch_id: body.batch_id });
            return commonResponse.success(languageCode, res, "GRADE_CREATED", 200, storeGrade);
        } catch (error) {
            console.error("Error creating grade:", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }
}
