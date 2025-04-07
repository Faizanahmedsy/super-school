import { Controller, Get, Post, Body, Param, Patch, Delete, Req, Res, UseGuards } from "@nestjs/common";
import { EventService } from "./event.service";
import { CreateEventDto } from "./dtos/create-event.dto";
import { UpdateEventDto } from "./dtos/update-event.dto";
import { ApiBearerAuth, ApiTags, ApiParam, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "src/decorator/role_decorator";
import { ROLE } from "helper/constants";
import { commonResponse } from "helper";
import { SocketGateway } from "../calendar_event/event.gateway";
import { AuditLogService } from "../audit_log/audit-log.service";
import { CreateMultiEventDto } from "./dtos/create-multi-event.dto";
import { NotificationService } from "../notification/notification.service";
import { In } from "typeorm";
import { RolesGuard } from "../auth/role-auth-guard";
import { StudentService } from "../student/student.service";
import { ModuleService } from "../module/module.service";
import { TeacherService } from "../teacher/teacher.service";
import { DivisionSubjectService } from "../division_subject/divisionsubject.service";
import { AdminService } from "../admin/admin.service";
import { InstituteService } from "../institutes/institutes.service";
import { UsersService } from "../users/user.service";
import { TimeTable } from "../time_table/time_table.entity";
@Controller("event")
@ApiBearerAuth()
@ApiTags("Event")
export class EventController {
    constructor(
        private eventService: EventService,
        private socketGateway: SocketGateway,
        private readonly auditLogService: AuditLogService,
        private notificationService: NotificationService,
        private studentServices: StudentService,
        private moduleServices: ModuleService,
        private teacherServices: TeacherService,
        private divisionSubjectServices: DivisionSubjectService,
        private adminServices: AdminService,
        private instituteServices: InstituteService,
        private usersService: UsersService
    ) {}

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Post("/create")
    async createEvent(@Body() createEventDto: CreateEventDto, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            createEventDto["created_by"] = req.user.userId;
            createEventDto["updated_by"] = req.user.userId;
            const divisionName = await this.eventService.getDivisionNameById(createEventDto.class_id);

            if (divisionName === null) {
                return commonResponse.error(languageCode, res, "DIVISION_NOT_FOUND", 404, {});
            }

            createEventDto["division_name"] = divisionName;
            const event = await this.eventService.createEvent(createEventDto);

            await this.auditLogService.create({
                action: "CREATE",
                message: `Event ${event.event_name} created.`,
                old_data: null,
                new_data: event,
                action_user_id: req.user.userId,
                role_id: req.user.role_id,

                school_id: event.school_id,
            });

            return commonResponse.success(languageCode, res, "EVENT_CREATED", 200, event);
        } catch (error) {
            console.log("🚀 ~ EventController ~ createEvent ~ error:", error);
            return commonResponse.error(languageCode, res, "EVENT_CREATION_FAILED", 400, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Patch("update/:id")
    @ApiParam({ name: "id", required: true, type: Number, description: "Event ID" })
    async updateEvent(@Param("id") id: number, @Body() updateEventDto: UpdateEventDto, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            updateEventDto["updated_by"] = req.user.userId;
            const checkExist = await this.eventService.eventDetail(id);
            console.log("🚀 ~ EventController ~ updateEvent ~ checkExist:", checkExist);
            if (!checkExist) {
                return commonResponse.error(languageCode, res, "DATA_NOT_FOUND", 404, {});
            }
            let oldBatch = { ...checkExist };
            let newUpdate = { ...checkExist, ...updateEventDto };
            const updatedEvent = await this.eventService.updateEvent(id, newUpdate);

            let creatorRole = await this.usersService.findById(req.user.userId);

            let module = await this.moduleServices.findModuleByNameShow("calendar");
            let fetchGrades: any;
            let fetchDivision: any;
            if (checkExist.type != "school") {
                fetchGrades = await this.eventService.findGradeById(Number(checkExist.grade_id));
                fetchDivision = await this.eventService.findDivisionById(checkExist.class_id);
            }
            let school = await this.instituteServices.findById(checkExist.school_id);
            let notificationPayload = {
                title: "Event Updates",
                message: "",
                school_id: newUpdate.school_id,
                created_by: req.user.userId,
                module_id: module.id,
                grade_id: null,
                grade_class_id: null,
            };
            let message = "";

            let auditLogMessage = "";

            if (creatorRole.role.role_name == "super_admin") {
                auditLogMessage = `The event "${updatedEvent.event_name}" has been updated at school "${school.school_name}" by super admin "${creatorRole.user_name}".`;
            } else {
                auditLogMessage = `The event "${updatedEvent.event_name}" has been updated at school "${school.school_name}" by admin "${creatorRole.user_name}".`;
            }

            if (checkExist.event_name !== updateEventDto.event_name && checkExist.type != "school") {
                const eventUpdateMessage = (schoolName: string, originalEventName: string, updatedEventName: string, grade: number, classes: string[]) => {
                    return `The event originally named "${originalEventName}" has been updated to "${updatedEventName}" at ${schoolName} for Grade ${grade} and Class(es) ${classes.join(
                        ", "
                    )}. Please check the updated details in your calendar.`;
                };

                message = eventUpdateMessage(school.school_name, checkExist.event_name, updateEventDto.event_name, fetchGrades.grade_number, [
                    `${fetchDivision.name}`,
                ]);
                notificationPayload.grade_id = fetchGrades.id;
                notificationPayload.grade_class_id = fetchDivision.id;
            } else {
                const eventUpdateMessage = (schoolName: string, eventName: string) => {
                    return `The event "${eventName}" at ${schoolName} has been updated. Please check your calendar for the latest details.`;
                };

                message = eventUpdateMessage(school.school_name, newUpdate.event_name);
            }

            notificationPayload.message = message;
            let sendNotificationTo = [];
            if (updatedEvent) {
                await this.auditLogService.create({
                    action: "UPDATE",
                    message: `The event "${updatedEvent.event_name}" has been updated at school "${school.school_name}".`,
                    old_data: oldBatch,
                    new_data: updatedEvent,
                    action_user_id: req.user.userId,
                    role_id: req.user.role_id,
                    school_id: updatedEvent.school_id,
                });

                if (checkExist.type != "school") {
                    let students = await this.studentServices.getStudentForEvent({ grade_id: fetchGrades.id, grade_class_id: fetchDivision.id });
                    let divisionTeacher = await this.divisionSubjectServices.getTeacherForEvent({ grade_id: fetchGrades.id, grade_class_id: fetchDivision.id });

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

                    let schoolAdmin = await this.adminServices.getAdminForEvent({ school_id: school.id });
                    if (schoolAdmin?.length) {
                        for (let object of schoolAdmin) {
                            if (object && object != null) {
                                let payload = { ...notificationPayload }; // Create a new object
                                payload["to_user_id"] = object.school_admin_user_id;
                                sendNotificationTo.push(payload);
                            }
                        }
                    }
                } else {
                    let students = await this.studentServices.getStudentForEvent({ school_id: school.id });

                    if (students?.length) {
                        for (let student of students) {
                            if (student && student != null) {
                                let payload = { ...notificationPayload }; // Create a new object
                                payload["to_user_id"] = student.student_user_id;
                                sendNotificationTo.push(payload);
                            }
                        }
                    }

                    let teacher = await this.teacherServices.getTeacherForEvent({ school_id: school.id });
                    if (teacher?.length) {
                        for (let object of teacher) {
                            if (object && object != null) {
                                let payload = { ...notificationPayload }; // Create a new object
                                payload["to_user_id"] = object.teacher_user_id;
                                sendNotificationTo.push(payload);
                            }
                        }
                    }

                    let schoolAdmin = await this.adminServices.getAdminForEvent({ school_id: school.id });
                    if (schoolAdmin?.length) {
                        for (let object of schoolAdmin) {
                            if (object && object != null) {
                                let payload = { ...notificationPayload }; // Create a new object
                                payload["to_user_id"] = object.school_admin_user_id;
                                sendNotificationTo.push(payload);
                            }
                        }
                    }
                }

                console.log("🚀 ~ EventController ~ createMultiEvent ~ sendNotificationTo:", sendNotificationTo);
                if (sendNotificationTo?.length) {
                    this.socketGateway.commonNotificationForAllModule(newUpdate.school_id);
                    this.notificationService.createMultiNotification(sendNotificationTo);
                }
                return commonResponse.success(languageCode, res, "EVENT_UPDATED", 200, updatedEvent);
            } else {
                return commonResponse.error(languageCode, res, "EVENT_NOT_FOUND", 404, {});
            }
        } catch (error) {
            console.log("🚀 ~ EventController ~ updateEvent ~ error:", error);
            return commonResponse.error(languageCode, res, "EVENT_UPDATE_FAILED", 400, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Delete("delete/:id")
    @ApiParam({ name: "id", required: true, type: Number, description: "Event ID" })
    async deleteEvent(@Param("id") id: number, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            const EventExists = await this.eventService.isExist({ id: id });
            if (!EventExists) {
                return commonResponse.error(languageCode, res, "PERMISSION_NOT_FOUND", 404, {});
            }
            if (String(EventExists.created_by) != String(req.user.userId)) {
                return commonResponse.error(languageCode, res, "NOT_AUTHORIZED_TO_DELETE_EVENT", 404, {});
            }
            let school = await this.instituteServices.findById(EventExists.school_id);

            let oldData = { ...EventExists };
            const deleted = await this.eventService.deleteEvent(id);

            let creatorRole = await this.usersService.findById(req.user.userId);
            let auditLogMessage = "";

            if (creatorRole.role.role_name == "super_admin") {
                auditLogMessage = `The event "${EventExists.event_name}" has been deleted at school "${school.school_name}" by super admin "${creatorRole.user_name}".`;
            } else {
                auditLogMessage = `The event "${EventExists.event_name}" has been deleted at school "${school.school_name}" by admin "${creatorRole.user_name}".`;
            }

            if (deleted) {
                const auditLogData = {
                    action: "DELETE",
                    message: auditLogMessage,
                    old_data: oldData,
                    new_data: null,
                    action_user_id: req.user.userId,
                    role_id: req.user.role_id,
                    school_id: EventExists.school_id,
                };

                await this.auditLogService.create(auditLogData);

                return commonResponse.success(languageCode, res, "EVENT_DELETED", 200, {});
            } else {
                return commonResponse.error(languageCode, res, "EVENT_NOT_FOUND", 404, {});
            }
        } catch (error) {
            console.log("🚀 ~ EventController ~ deleteEvent ~ error:", error);
            return commonResponse.error(languageCode, res, "EVENT_DELETION_FAILED", 400, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.STUDENT)
    @Get("list")
    @ApiQuery({ name: "school_id", required: false, type: Number, example: 1, description: "Filter by school_id id role is superadmin" })
    async getEvents(@Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            let event = [];

            if (req.user.role_name == ROLE.TEACHER) {
                let teacher = await this.eventService.fetchTeacher(req.user.userId);
                if (!teacher) {
                    return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
                }
                event = await this.eventService.fetchEventsForTeacher(teacher.id, req.user.institute_id);
            } else if (req.user.role_name == ROLE.STUDENT) {
                let student = await this.eventService.fetchStudent(req.user.userId);
                if (!student) {
                    return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
                }
                event = await this.eventService.fetchStudentEvent(student, req.user.institute_id);
            } else if (req.user.role_name == ROLE.SUB_ADMIN) {
                event = await this.eventService.getEventsForAdmin(req.user.institute_id);
            } else {
                event = await this.eventService.getEvents(req.query);
            }

            // Apply event transformation
            if (event?.length) {
                function convertTo12Hour(time24) {
                    if (!time24) return "";

                    let [hours, minutes] = time24.split(":").map(Number);
                    let period = hours >= 12 ? "pm" : "am";

                    hours = hours % 12 || 12;
                    minutes = String(minutes).padStart(2, "0");

                    return `${String(hours).padStart(2, "0")}:${minutes}${period}`;
                }

                event = event.map((data) => {
                    let startTime = data.start_time ? convertTo12Hour(data.start_time) : "";
                    let endTime = data.end_time ? convertTo12Hour(data.end_time) : "";

                    let eventTime = startTime ? `${startTime} ` : "";
                    let timeTableTime = startTime && endTime ? `${startTime} - ${endTime} ` : "";
                    if (data["type"] !== "Exam") {
                        let modifiedEventName = data.event_name;
                        data["event_outside"] = eventTime + data.event_name;

                        if (data?.grade) {
                            data.event_outside += ` - ${data.grade.grade_number}`;
                            modifiedEventName += ` - ${data.grade.grade_number}`;
                        }
                        if (data.division) {
                            data.event_outside += ` ${data.division.name}`;
                            modifiedEventName += ` ${data.division.name}`;
                        }
                        data.event_name = modifiedEventName;
                    } else {
                        data.event_outside = eventTime + data.event_name;
                    }

                    delete data.grade;
                    delete data.division;

                    return data;
                });
            }

            function expandEvents(event: CreateMultiEventDto[]) {
                let expandedEvents = [];

                event.forEach((event) => {
                    let startDate = new Date(event.start_date);
                    let endDate = new Date(event.end_date);

                    // If the start and end date are the same, push it as is
                    if (startDate.getTime() === endDate.getTime()) {
                        expandedEvents.push(event);
                    } else {
                        // Generate a record for each date in between
                        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                            let newEvent = { ...event }; // Clone the object
                            newEvent.start_date = new Date(d).toISOString().split("T")[0] + "T00:00:00.000Z";
                            newEvent.end_date = newEvent.start_date; // Make start and end date the same
                            expandedEvents.push(newEvent);
                        }
                    }
                });

                return expandedEvents;
            }

            let cloneEvents = expandEvents(event);

            return commonResponse.success(languageCode, res, "EVENT_LIST", 200, cloneEvents);
        } catch (error) {
            console.log("🚀 ~ EventController ~ getEvents ~ error:", error);
            return commonResponse.error(languageCode, res, "EVENT_LIST_FAILED", 400, {});
        }
    }

    // /*
    //  *   Create Multi event
    //  */
    // @UseGuards(JwtAuthGuard)
    // @Roles(ROLE.MASTER_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION, ROLE.SUB_ADMIN, ROLE.TEACHER)
    // @Post("/multi-create")
    // async createMultiEvent(@Body() createMultiEventDto: CreateMultiEventDto, @Req() req, @Res() res) {
    //     const languageCode = req.headers["language_code"];
    //     try {
    //         createMultiEventDto["created_by"] = req.user.userId;
    //         createMultiEventDto["updated_by"] = req.user.userId;
    //         const divisionName = await this.eventService.getDivisionNameById(createMultiEventDto.class_id);

    //         if (divisionName === null) {
    //             return commonResponse.error(languageCode, res, "DIVISION_NOT_FOUND", 404, {});
    //         }

    //         createMultiEventDto["division_name"] = divisionName;

    //         const event = await this.eventService.createMultiEvent(createMultiEventDto);

    //         console.log("🚀 ~ file: event.controller.ts:161 ~ EventController ~ createMultiEvent ~ event:", event);

    //         // this.socketGateway.emitClassEventUpdate(createMultiEventDto.class_id, event);

    //         if (Array.isArray(event)) {
    //             // Handle array of events
    //             event.map(async (data) => {
    //                 await this.auditLogService.create({
    //                     action: "CREATE",
    //                     message: `Event ${data.event_name} created.`,
    //                     old_data: null,
    //                     new_data: event,
    //                     action_user_id: req.user.userId,
    //                     role_id: req.user.role_id,

    //                     school_id: data.school_id,
    //                 });

    //                 await this.notificationService.createNotification({
    //                     title: `Event created: ${data.event_name}`,
    //                     message: `New event: ${data.event_name}`,
    //                     school_id: data.school_id,
    //                     class_id: data.class_id ? data.class_id : null,
    //                     division_id: data.id ? data.id : null,
    //                     created_by: data.created_by,
    //                 });
    //             });
    //         } else {
    //             await this.auditLogService.create({
    //                 action: "CREATE",
    //                 message: `Event ${event.event_name} created.`,
    //                 old_data: null,
    //                 new_data: event,
    //                 action_user_id: req.user.userId,
    //                 role_id: req.user.role_id,

    //                 school_id: event.school_id,
    //             });
    //         }
    //         return commonResponse.success(languageCode, res, "EVENT_CREATED", 200, event);
    //     } catch (error) {
    //         console.log("🚀 ~ file: event.controller.ts:176 ~ EventController ~ createMultiEvent ~ error:", error);
    //         return commonResponse.error(languageCode, res, "EVENT_CREATION_FAILED", 400, {});
    //     }
    // }

    // /*
    //  *   Create Multi event
    //  */
    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Post("/multi-create")
    async createMultiEvent(@Body() createMultiEventDto: CreateMultiEventDto, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            createMultiEventDto["created_by"] = req.user.userId;
            createMultiEventDto["updated_by"] = req.user.userId;
            const { school_id, grade_id, class_id, event_name, description, start_date, end_date, start_time, end_time, type } = createMultiEventDto;
            let created_by = createMultiEventDto["created_by"];
            let updated_by = createMultiEventDto["updated_by"];
            let initialPayload = {
                school_id,
                grade_id: null,
                class_id: null,
                event_name,
                type,
                description,
                start_date,
                end_date,
                start_time,
                end_time,
                created_by,
                updated_by,
            };

            let school = await this.instituteServices.findById(school_id);
            console.log("🚀 ~ EventController ~ createMultiEvent ~ school:", school);
            let module = await this.moduleServices.findModuleByNameShow("calendar");
            let sendNotificationTo = [];
            let notificationPayload = {
                title: "Event",
                message: "",
                school_id: school_id,
                created_by: req.user.userId,
                module_id: module.id,
            };

            if (req.user.role_name == ROLE.STUDENT && type == "student") {
                let fetchUser = await this.eventService.fetchStudent(req.user.userId);
                if (!fetchUser) {
                    return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
                }
                let object = {
                    school_id: req.user.institute_id,
                    grade_id: fetchUser.grade_id,
                    class_id: fetchUser.grade_class_id,
                };
                let mergedObject = { ...initialPayload, ...object };
                let createEvent = await this.eventService.createSingleEvent(mergedObject);
                if (!createEvent) {
                    return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
                }
                return commonResponse.success(languageCode, res, "EVENT_CREATED", 200, {});
            }

            if (type === "school") {
                const event = this.eventService.createSingleEvent(initialPayload);
                let students = await this.studentServices.getStudentForEvent({ school_id: school_id });
                notificationPayload.message = `An event "${event_name}" has been organized at ${school.school_name}. Please check the calendar for further details.`;
                if (students?.length) {
                    for (let student of students) {
                        if (student && student != null) {
                            let payload = { ...notificationPayload }; // Create a new object
                            payload["to_user_id"] = student.student_user_id;
                            sendNotificationTo.push(payload);
                        }
                    }
                }

                let teacher = await this.teacherServices.getTeacherForEvent({ school_id: school_id });
                if (teacher?.length) {
                    for (let object of teacher) {
                        if (object && object != null) {
                            let payload = { ...notificationPayload }; // Create a new object
                            payload["to_user_id"] = object.teacher_user_id;
                            sendNotificationTo.push(payload);
                        }
                    }
                }

                let schoolAdmin = await this.adminServices.getAdminForEvent({ school_id: school_id });
                if (schoolAdmin?.length) {
                    for (let object of schoolAdmin) {
                        if (object && object != null) {
                            let payload = { ...notificationPayload }; // Create a new object
                            payload["to_user_id"] = object.school_admin_user_id;
                            sendNotificationTo.push(payload);
                        }
                    }
                }
            }

            // Case 2: If type is Grade
            else if (type == "grade") {
                const gradeMessage = (schoolName: string, eventName: string, grades: number[]) =>
                    `An event "${eventName}" has been organized at ${schoolName} for grade(s): ${grades.join(
                        ", "
                    )}. Please check the calendar for further details.`;

                if (!grade_id?.length) {
                    return commonResponse.error(languageCode, res, "GRADE_ID_REQUIRED", 400, {});
                }

                // let gradeIdArray = grade_id.map((id) => Number(id));
                let fetchAllGrades = await this.eventService.findGrade({ where: { id: In(grade_id) } });
                let grades = fetchAllGrades.map((data) => data.grade_number);
                notificationPayload.message = gradeMessage(school.school_name, event_name, grades);

                let fetchClass = await this.eventService.findDivision({ where: { grade_id: In(grade_id) } });
                let customArray = [];
                for (let data of fetchAllGrades) {
                    let object = {
                        school_id: school_id,
                        grade_id: data.id,
                        // class_id: data.id,
                    };
                    let mergedObject = { ...initialPayload, ...object };
                    customArray.push(mergedObject);
                }
                await this.eventService.createMultiple(customArray);

                // Create Event Notification

                // Your school has organized an event: [event_name xyz]. Please check for details.

                let students = await this.studentServices.getStudentForEvent({ grade_id: In(grade_id) });
                let divisionTeacher = await this.divisionSubjectServices.getTeacherForEvent({ grade_id: In(grade_id) });
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
            } else if (type == "class") {
                if (!grade_id?.length) {
                    return commonResponse.error(languageCode, res, "GRADE_ID_REQUIRED", 400, {});
                }
                if (!class_id?.length) {
                    return commonResponse.error(languageCode, res, "DIVISION_ID_REQUIRED", 400, {});
                }
                if (grade_id?.length > 1) {
                    return commonResponse.error(languageCode, res, "MAXIMUM_GRADE_ALLOWED_TO_BE", 400, {});
                }
                let gradeId = grade_id[0];

                let fetchAllGrades = await this.eventService.findGradeById(Number(gradeId));
                let grade = fetchAllGrades.grade_number;

                let division = await this.eventService.findDivision({ where: { grade_id: In(grade_id) } });
                let classesArray = division.map((data) => data.name);

                if (!division?.length) {
                    return commonResponse.error(languageCode, res, "INVALID_DIVISION_ID", 400, {});
                }
                const gradeClassMessage = (schoolName: string, eventName: string, grade: number, classes: string[]) => {
                    return `An event "${eventName}" has been organized at ${schoolName} for Grade ${grade} (Classes: ${classes.join(
                        ", "
                    )}). Please check the calendar for further details.`;
                };
                notificationPayload.message = gradeClassMessage(school.school_name, event_name, grade, classesArray);
                let customArray = [];
                let divisionIdsArray = [];
                for (let data of division) {
                    if (class_id.includes(String(data.id))) {
                        let object = {
                            school_id: school_id,
                            grade_id: gradeId,
                            class_id: data.id,
                        };
                        let mergedObject = { ...initialPayload, ...object };
                        customArray.push(mergedObject);
                        divisionIdsArray.push(data.id);
                    }
                }
                await this.eventService.createMultiple(customArray);
                let students = await this.studentServices.getStudentForEvent({ grade_id: gradeId, grade_class_id: In(divisionIdsArray) });
                let divisionTeacher = await this.divisionSubjectServices.getTeacherForEvent({ grade_id: gradeId, grade_class_id: In(divisionIdsArray) });
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
            }

            console.log("🚀 ~ EventController ~ createMultiEvent ~ sendNotificationTo:", sendNotificationTo);
            if (sendNotificationTo?.length) {
                this.socketGateway.commonNotificationForAllModule(school_id);
                this.notificationService.createMultiNotification(sendNotificationTo);
            }
            return commonResponse.success(languageCode, res, "EVENT_CREATED", 200, {});
        } catch (error) {
            console.log("🚀 ~ EventController ~ createMultiEvent ~ error:", error);
            return commonResponse.error(languageCode, res, "EVENT_CREATION_FAILED", 400, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Get(":id")
    @ApiParam({ name: "id", required: true, type: Number, example: 1, description: "Event Id" })
    async getEventsDetail(@Param("id") id: number, @Req() req: any, @Res() res: any) {
        const languageCode = req.headers["language_code"];
        try {
            const events = await this.eventService.eventDetailWithPop(id);
            if (!events) {
                return commonResponse.success(languageCode, res, "DATA_NOT_FOUND", 200, {});
            }
            return commonResponse.success(languageCode, res, "EVENT_DETAIL", 200, events);
        } catch (error) {
            console.log("🚀 ~ EventController ~ getEventsDetail ~ error:", error);
            return commonResponse.error(languageCode, res, "EVENT_DETAIL_FAILED", 400, {});
        }
    }
}
