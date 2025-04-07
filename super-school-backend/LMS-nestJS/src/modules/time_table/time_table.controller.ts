import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, Res, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { TimeTableService } from "./time_table.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ROLE } from "helper/constants";
import { Roles } from "src/decorator/role_decorator";
import { CreateTimeTable } from "./dto/create-time-table.dto";
import { commonResponse } from "helper";
import { DivisionSubjectService } from "../division_subject/divisionsubject.service";
import { TeacherService } from "../teacher/teacher.service";
import { RolesGuard } from "../auth/role-auth-guard";
import { StudentService } from "../student/student.service";
import { ModuleService } from "../module/module.service";
import { SocketGateway } from "../calendar_event/event.gateway";
import { NotificationService } from "../notification/notification.service";

import { In } from "typeorm";
@Controller("time-table")
@ApiBearerAuth()
@ApiTags("TimeTable")
export class TimeTableController {
    constructor(
        private timeTableServives: TimeTableService,
        private socketGateway: SocketGateway,
        private notificationService: NotificationService,
        private divisionSubjectServices: DivisionSubjectService,
        private teacherServices: TeacherService,
        private stuentServices: StudentService,
        private moduleServices: ModuleService
    ) {}

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Post("/create")
    async createTimeTable(@Body() body: CreateTimeTable, @Req() req: any, @Res() res: any) {
        const languageCode = req.headers["language_code"];
        try {
            if (req.user.role_name == "teacher") {
                let teacher = await this.teacherServices.getTeacherByQuery({ teacher_user_id: req.user.userId });
                if (teacher) {
                    let isSubjectBelongsToTeacher = await this.divisionSubjectServices.isExistCheckWithQuery({
                        teacher_id: teacher.id,
                        subject_id: body.subject_id,
                    });
                    if (!isSubjectBelongsToTeacher) {
                        return commonResponse.error(languageCode, res, "CANNOT_CREATE_TIME_TABLE", 400, {});
                    }
                } else {
                    return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
                }
            }

            if (req.user.role_name == "admin") {
                if (String(req.user.institute_id) != String(body.school_id)) {
                    return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
                }
            }

            let query = {
                start_date: body.start_date,
                end_date: body.end_date,
                start_time: body.start_time,
                end_time: body.end_time,
                subject_id: body.subject_id,
                school_id: body.school_id,
                grade_id: body.grade_id,
                class_id: body.class_id,
                batch_id: body.batch_id,
                term_id: body.term_id,
            };
            let checkIsExist = await this.timeTableServives.isExist(query);

            if (checkIsExist) {
                return commonResponse.error(languageCode, res, "TIME_TABLE_ALREADY_EXIST", 409, {});
            }

            body["created_by"] = req.user.userId;
            let createTimeTable = await this.timeTableServives.create(body);
            if (!createTimeTable) {
                return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
            }

            // fetch all student
            let students = await this.stuentServices.getStudentByQuery({ school_id: body.school_id, grade_id: body.grade_id });
            let divisionTeacher = await this.divisionSubjectServices.getDivisionSubjectByQuery({ school_id: body.school_id, grade_id: body.grade_id });
            if (students?.length) {
                if (body.class_id) {
                    students = students.filter((e) => String(e.grade_class_id) == String(body.class_id));
                }
            }
            if (divisionTeacher?.length) {
                divisionTeacher = divisionTeacher.filter((e) => String(e.grade_class_id) == String(body.class_id));
            }
            let module = await this.moduleServices.findModuleByNameShow("exam_timetable");
            let sendNotificationTo = [];
            let notificationPayload = {
                title: "Timetable",
                message: "A new timetable has been added. Please check for more details.",
                school_id: body.school_id,
                created_by: req.user.userId,
                module_id: module.id,
            };
            if (students?.length) {
                for (let student of students) {
                    if (student && student != null) {
                        let payload = { ...notificationPayload };
                        payload["to_user_id"] = student.student_user_id;
                        sendNotificationTo.push(payload);
                    }
                }
            }

            if (divisionTeacher?.length) {
                const uniqueTeacherIds = [...new Set(divisionTeacher.map((item) => item.teacher_id))];
                if (uniqueTeacherIds?.length) {
                    let teacher = await this.teacherServices.getTeacherForEvent({ id: In(uniqueTeacherIds) });
                    if (teacher?.length) {
                        for (let object of teacher) {
                            if (object && object != null) {
                                let payload = { ...notificationPayload };
                                payload["to_user_id"] = object.teacher_user_id;
                                sendNotificationTo.push(payload);
                            }
                        }
                    }
                }
            }
            if (sendNotificationTo?.length) {
                this.socketGateway.commonNotificationForAllModule(body.school_id);
                this.notificationService.createMultiNotification(sendNotificationTo);
            }

            return commonResponse.success(languageCode, res, "TIME_TABLE_CREATED", 201, createTimeTable);
        } catch (error) {
            console.log("🚀 ~ TimeTableController ~ createTimeTable ~ error:", error);
            return commonResponse.error(languageCode, res, "INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Patch("update/:id")
    async updateTimetable(@Param("id") id: number, @Body() body: CreateTimeTable, @Req() req: any, @Res() res: any) {
        const languageCode = req.headers["language_code"];
        try {
            let isExistRecord = await this.timeTableServives.isExist({ id: id });
            if (!isExistRecord) {
                return commonResponse.error(languageCode, res, "DATA_NOT_FOUND", 400, {});
            }

            let newUpdate = { ...isExistRecord, ...body };

            if (req.user.role_name == "teacher") {
                let teacher = await this.teacherServices.getTeacherByQuery({ teacher_user_id: req.user.userId });
                if (teacher) {
                    let isSubjectBelongsToTeacher = await this.divisionSubjectServices.isExistCheckWithQuery({
                        teacher_id: teacher.id,
                        subject_id: newUpdate.subject_id,
                    });
                    if (!isSubjectBelongsToTeacher) {
                        return commonResponse.error(languageCode, res, "CANNOT_CREATE_TIME_TABLE", 400, {});
                    }
                } else {
                    return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
                }
            }

            if (req.user.role_name == "admin") {
                if (String(req.user.institute_id) != String(body.school_id)) {
                    return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
                }
            }

            let query = {
                start_date: newUpdate.start_date,
                end_date: newUpdate.end_date,
                start_time: newUpdate.start_time,
                end_time: newUpdate.end_time,
                subject_id: newUpdate.subject_id,
                school_id: newUpdate.school_id,
                grade_id: newUpdate.grade_id,
                class_id: newUpdate.class_id,
                batch_id: newUpdate.batch_id,
                term_id: newUpdate.term_id,
            };

            let checkIsExist = await this.timeTableServives.isExist(query);

            if (checkIsExist && String(checkIsExist.id) != String(isExistRecord.id)) {
                return commonResponse.error(languageCode, res, "TIME_TABLE_ALREADY_EXIST", 409, {});
            }
            newUpdate["updated_by"] = req.user.userId;
            let updateData = await this.timeTableServives.updateTimetable(newUpdate);
            if (!updateData) {
                return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
            }

            return commonResponse.success(languageCode, res, "TIME_TABLE_UPDATED", 200, {});
        } catch (error) {
            console.log("🚀 ~ TimeTableController ~ updateTimetable ~ error:", error);
            return commonResponse.error(languageCode, res, "INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.STUDENT)
    @Get("list")
    @ApiQuery({
        name: "sort",
        required: false,
        type: String,
        example: "asc",
        description: "Sort order (asc/desc)",
    })
    @ApiQuery({
        name: "limit",
        required: false,
        type: Number,
        example: 10,
        description: "Limit the number of results",
    })
    @ApiQuery({
        name: "page",
        required: false,
        type: Number,
        example: 1,
        description: "Page number for pagination",
    })
    @ApiQuery({ name: "sort", required: false, type: String, example: "asc", description: "Sort order (asc/desc)" })
    @ApiQuery({ name: "school_id", required: false, type: Number, example: 1, description: "Filter by school_id" })
    @ApiQuery({ name: "grade_id", required: false, type: Number, example: 8, description: "Filter by grade_id" })
    @ApiQuery({ name: "class_id", required: false, type: Number, example: 1, description: "Filter by class_id" })
    @ApiQuery({ name: "subject_id", required: false, type: Number, example: 1, description: "Filter by subject_id" })
    @ApiQuery({ name: "batch_id", required: false, type: Number, example: 1, description: "Filter by batch_id" })
    @ApiQuery({ name: "search", required: false, type: String, example: "Name", description: "Search by name" })
    async getList(@Req() req: any, @Res() res: any, @Query() query: any) {
        const languageCode = req.headers["language_code"];
        try {
            if (req?.user?.institute_id) {
                query.school_id = req.user.institute_id;
            }
            let timeTable = await this.timeTableServives.getList(query);

            if (!timeTable) {
                return commonResponse.error(languageCode, res, "DATA_NOT_FOUND", 200, {});
            }
            return commonResponse.success(languageCode, res, "TIME_TABLE_LIST", 200, timeTable);
        } catch (error) {
            console.log("🚀 ~ TimeTableController ~ getList ~ error:", error);
            return commonResponse.error(languageCode, res, "INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.STUDENT)
    @Get(":id")
    async getDetail(@Param("id") id: number, @Req() req: any, @Res() res: any) {
        const languageCode = req.headers["language_code"];
        try {
            let isExist = await this.timeTableServives.detail({ id: id });
            if (!isExist) {
                return commonResponse.error(languageCode, res, "DATA_NOT_FOUND", 400, {});
            }
            return commonResponse.success(languageCode, res, "TIME_TABLE_DETAIL", 200, isExist);
        } catch (error) {
            console.log("🚀 ~ TimeTableController ~ getDetail ~ error:", error);
            return commonResponse.error(languageCode, res, "INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Delete("delete/:id")
    async deleteTimeTable(@Param("id") id: number, @Req() req: any, @Res() res: any) {
        const languageCode = req.headers["language_code"];
        try {
            let isExist = await this.timeTableServives.isExist({ id: id });
            if (!isExist) {
                return commonResponse.error(languageCode, res, "DATA_NOT_FOUND", 400, {});
            }
            const deleted = await this.timeTableServives.deleteEvent(isExist);
            if (!deleted) {
                return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
            }
            return commonResponse.success(languageCode, res, "TIME_TABLE_DELETED", 200, {});
        } catch (error) {
            console.log("🚀 ~ TimeTableController ~ deleteTimeTable ~ error:", error);
            return commonResponse.error(languageCode, res, "INTERNAL_SERVER_ERROR", 500, {});
        }
    }
}
