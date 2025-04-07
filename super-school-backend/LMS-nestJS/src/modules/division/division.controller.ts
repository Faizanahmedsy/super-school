import { Controller, Get, Post, Body, Param, Patch, Req, Res, Delete, Query, UseGuards } from "@nestjs/common";
import { DivisionService } from "./division.service";
import { commonResponse } from "helper";
import { CreateDivisionDto } from "./dtos/create-division.dto";
import { UpdateDivisionDto } from "./dtos/update-division.dto";
import { Division } from "./division.entity";
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/decorator/role_decorator";
import { ROLE } from "helper/constants";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { MultiCreateDivisionDto } from "./dtos/multi-create-division.dto";
import { AuditLogService } from "../audit_log/audit-log.service";
import { TeacherService } from "../teacher/teacher.service";
import { MultiCreateDivisionDtoForSetupWizard } from "./dtos/manage-division-setup-wizard";
import { EventService } from "../calendar_event/event.service";
import { TimeTableService } from "../time_table/time_table.service";
@Controller("division")
@ApiBearerAuth()
@ApiTags("Division")
export class DivisionController {
    constructor(
        private divisionService: DivisionService,
        private readonly auditLogService: AuditLogService,
        private readonly teacherService: TeacherService,
        private readonly eventService: EventService,
        private readonly timetableService: TimeTableService
    ) {}

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Post("/create")
    async createDivision(@Body() createDivisionDto: CreateDivisionDto, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            if (req.user.institute_id) {
                createDivisionDto["school_id"] = req.user.institute_id;
            } else {
                if (!createDivisionDto.school_id) {
                    return commonResponse.error(languageCode, res, "SCHOOL_REQUIRED", 409, {});
                }
            }
            let checkExist = await this.divisionService.isExist({
                name: createDivisionDto.name,
                grade_id: createDivisionDto.grade_id,
                batch_id: createDivisionDto.batch_id,
            });
            if (checkExist) {
                return commonResponse.error(languageCode, res, "DIVISION_ALREADY_EXISTS", 400, {});
            }
            createDivisionDto["created_by"] = req.user.userId;
            let create = await this.divisionService.createDivision(createDivisionDto);
            if (create) {
                await this.auditLogService.create({
                    action: "CREATE",
                    message: `Grade Class ${create.name} created.`,
                    old_data: null,
                    new_data: create,
                    action_user_id: req.user.userId,
                    role_id: req.user.role_id,

                    school_id: create.school_id,
                });
                return commonResponse.success(languageCode, res, "DIVISION_CREATED", 200, create);
            } else {
                return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
            }
        } catch (error) {
            console.error("Error create division:", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Post("/multi/create")
    async multiCreateDivision(@Body() multiCreateDivisionDto: MultiCreateDivisionDto, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            if (req.user.institute_id) {
                multiCreateDivisionDto["school_id"] = req.user.institute_id;
            } else {
                if (!multiCreateDivisionDto.school_id) {
                    return commonResponse.error(languageCode, res, "SCHOOL_REQUIRED", 409, {});
                }
            }
            let added = [];
            for (let index = 0; index < multiCreateDivisionDto.divisions.length; index++) {
                const singleGrade = multiCreateDivisionDto.divisions[index];
                for (let index1 = 0; index1 < singleGrade.division.length; index1++) {
                    let singleDivision: any = singleGrade.division[index1];
                    let checkExist = await this.divisionService.isExist({
                        name: singleDivision,
                        grade_id: singleGrade.grade_id,
                        batch_id: singleGrade.batch_id,
                    });
                    if (!checkExist) {
                        let payload: any = {
                            name: singleDivision,
                            created_by: req.user.userId,
                            grade_id: singleGrade.grade_id,
                            school_id: multiCreateDivisionDto.school_id,
                            batch_id: singleGrade.batch_id,
                        };
                        let create = await this.divisionService.createDivision(payload);
                        if (create) {
                            added.push(create);
                        }
                    }
                }
            }
            if (added.length > 0) {
                const divisionDetails = added.map((division) => `Grade Class ${division.grade_id} - ${division.name}`).join(", ");

                await this.auditLogService.create({
                    action: "CREATE",
                    message: `Grade Class ${divisionDetails} created.`,
                    old_data: null,
                    new_data: added,
                    action_user_id: req.user.userId,
                    role_id: req.user.role_id,
                });
                return commonResponse.success(languageCode, res, "DIVISION_CREATED", 200, added);
            } else {
                return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
            }
        } catch (error) {
            console.error("Error create division:", error);
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
    @ApiQuery({ name: "grade_id", required: false, type: Number, example: 1, description: "Filter by grade_id" })
    @ApiQuery({ name: "batch_id", required: false, type: Number, example: 1, description: "Filter by batch_id" })
    @ApiQuery({ name: "subject_id", required: false, type: Number, example: 1, description: "Filter by subject_id" })
    @ApiQuery({ name: "checkStudent", required: false, type: Boolean, example: false, description: "Student count based filter" })
    async getDivisions(@Req() req, @Res() res, @Query() query: any) {
        const languageCode = req.headers["language_code"];
        try {
            if (req.user.institute_id) {
                query["school_id"] = req.user.institute_id;
            }
            if (req.user.role_name == "teacher") {
                let teacherId = await this.teacherService.getTeacherByObj({ teacher_user_id: req.user.userId });

                if (!teacherId) {
                    return commonResponse.error(languageCode, res, "TEACHER_NOT_FOUND", 400, {});
                } else {
                    query["teacher_id"] = teacherId.id;
                }
            }
            let list = await this.divisionService.getDivisions(query);
            if (list) {
                return commonResponse.success(languageCode, res, "DIVISION_LIST", 200, list);
            } else {
                return commonResponse.error(languageCode, res, "DIVISION_LIST_ERROR", 400, {});
            }
        } catch (error) {
            console.log("🚀 ~ file: division.controller.ts:159 ~ DivisionController ~ getDivisions ~ error:", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Get(":id")
    @ApiParam({ name: "id", required: true, type: Number, example: 1, description: "Division ID" })
    async getDivisionById(@Param("id") id: number, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            let divisionDetails = await this.divisionService.getDivisionById(id);
            if (divisionDetails) {
                return commonResponse.success(languageCode, res, "DIVISION_DETAILS", 200, divisionDetails);
            } else {
                return commonResponse.error(languageCode, res, "DIVISION_NOT_FOUND", 400, {});
            }
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Patch("patch/:id")
    @ApiParam({ name: "id", required: true, type: Number, example: 1, description: "Division ID" })
    async updateDivision(@Param("id") id: number, @Body() updateDivisionDto: UpdateDivisionDto, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            const checkExist = await this.divisionService.isExist({ id: id });
            if (!checkExist) {
                return commonResponse.error(languageCode, res, "DIVISION_NOT_FOUND", 400, {});
            }
            updateDivisionDto["updated_by"] = req.user.userId;
            const oldGrade = JSON.parse(JSON.stringify(checkExist));
            const updatedDivision = await this.divisionService.updateDivision(id, updateDivisionDto);
            if (updatedDivision) {
                await this.auditLogService.create({
                    action: "UPDATE",
                    message: `Grade Class ${updatedDivision.name} updated.`,
                    old_data: oldGrade,
                    new_data: updatedDivision,
                    action_user_id: req.user.userId,
                    role_id: req.user.role_id,

                    school_id: updatedDivision.school_id,
                });
                return commonResponse.success(languageCode, res, "DIVISION_UPDATED_SUCCESS", 200, updatedDivision);
            } else {
                return commonResponse.error(languageCode, res, "DIVISION_UPDATE_ERROR", 400, {});
            }
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Delete("delete/:id")
    @ApiParam({ name: "id", required: true, type: Number, example: 1, description: "Division ID" })
    async deleteDivision(@Param("id") id: number, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            let checkExist = await this.divisionService.isExist({ id: id });

            if (!checkExist) {
                return commonResponse.error(languageCode, res, "DIVISION_NOT_FOUND", 404, {});
            }

            // // check for division subject entries for this CLASS
            let isExistDivisionSubject = await this.divisionService.isExistCheckWithQuery({
                grade_class_id: checkExist.id,
                school_id: checkExist.school_id,
                grade_id: checkExist.grade_id,
                batch_id: checkExist.batch_id,
            });

            if (isExistDivisionSubject) {
                return commonResponse.error(languageCode, res, "YOU_CANNOT_DELETE_THIS_CLASS", 400, {});
            }

            let isExistEvent = await this.eventService.getEventByQuery({
                class_id: checkExist.id,
                school_id: checkExist.school_id,
                grade_id: checkExist.grade_id,
                // batch_id: checkExist.batch_id,
            });
            console.log("🚀 ~ DivisionController ~ deleteDivision ~ isExistEvent:", isExistEvent);

            let isExistTimeTable = await this.timetableService.getTimeTableByQuery({
                class_id: checkExist.id,
                school_id: checkExist.school_id,
                grade_id: checkExist.grade_id,
                batch_id: checkExist.batch_id,
            });
            console.log("🚀 ~ DivisionController ~ deleteDivision ~ isExistTimeTable:", isExistTimeTable);

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

            await this.divisionService.deleteDivision(checkExist);
            const deletedAt = new Date();
            const auditLogData = {
                action: "DELETE",
                message: `Grade Class ${checkExist.name} deleted.`,
                old_data: oldData,
                new_data: null,
                action_user_id: req.user.userId,
                role_id: req.user.role_id,

                school_id: checkExist.school_id,
                deleted_at: deletedAt,
            };
            await this.auditLogService.create(auditLogData);

            return commonResponse.success(languageCode, res, "DIVISION_DELETED_SUCCESS", 200, {});
        } catch (error) {
            console.log("🚀 ~ DivisionController ~ deleteDivision ~ error:", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Patch("/manage-division-for-setup-wizard")
    async multiCreateDivisioForSetupWizard(@Body() body: MultiCreateDivisionDtoForSetupWizard, @Req() req: any, @Res() res: any) {
        const languageCode = req.headers["language_code"];
        try {
            if (req.user.institute_id) {
                body["school_id"] = req.user.institute_id;
            } else {
                if (!body.school_id) {
                    return commonResponse.error(languageCode, res, "SCHOOL_REQUIRED", 409, {});
                }
            }

            let fetchAllDivision = await this.divisionService.getMultiDivisionByQuery({ school_id: body.school_id, batch_id: body.batch_id });

            let existDivision: { grade_id: number; name: string[] }[] = Object.values(
                fetchAllDivision.reduce((acc, { grade_id, name }) => {
                    if (!acc[grade_id]) {
                        acc[grade_id] = { grade_id, name: [] };
                    }
                    acc[grade_id].name.push(name);
                    return acc;
                }, {} as Record<number, { grade_id: number; name: string[] }>)
            );
            let newDivision = body.divisions;

            const result = newDivision.map(({ grade_id, name }) => {
                const existingDivisions = existDivision.find((item) => String(item.grade_id) == String(grade_id)) || { grade_id, name: [] };

                return {
                    grade_id,
                    removedDivisions: existingDivisions.name.filter((div) => !name.includes(div)),
                    addedDivisions: name.filter((div) => !existingDivisions.name.includes(div)),
                };
            });

            let deletePayload = [];
            let addedPayload = [];
            for (let data of result) {
                if (data?.removedDivisions?.length) {
                    data.removedDivisions.map((division: string) => {
                        deletePayload.push({ grade_id: data.grade_id, name: division, school_id: body.school_id, batch_id: body.batch_id });
                    });
                }
                if (data?.addedDivisions?.length) {
                    data.addedDivisions.map((division: string) => {
                        addedPayload.push({
                            grade_id: data.grade_id,
                            name: division,
                            school_id: body.school_id,
                            batch_id: body.batch_id,
                            created_by: req.user.userId,
                        });
                    });
                }
            }
            if (deletePayload?.length) {
                let fetchDivision = await this.divisionService.getMultiDivisionByQuery(deletePayload);

                let deletedIds = fetchDivision.map((data) => data.id);

                if (deletedIds?.length) {
                    await this.divisionService.hardDeleteDivision(deletedIds);
                }
            }

            if (addedPayload?.length) {
                await this.divisionService.createBulk(addedPayload);
            }

            return commonResponse.success(languageCode, res, "DIVISION_CREATED", 200, {});
        } catch (error) {
            console.error("Error create division:", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }
}
