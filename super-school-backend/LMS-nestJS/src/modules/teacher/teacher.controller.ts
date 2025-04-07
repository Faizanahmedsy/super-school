import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Req,
    Res,
    Delete,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    InternalServerErrorException,
} from "@nestjs/common";
import { TeacherService } from "./teacher.service";
import { commonResponse } from "helper";
import { CreateTeacherDto } from "./dtos/create-teacher.dto";
import { UpdateTeacherDto } from "./dtos/update-teacher.dto";
import { Teacher } from "./teacher.entity";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/decorator/role_decorator";
import { ROLE, DEFAULT_AVTAR } from "helper/constants";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UsersService } from "../users/user.service";
import { commonFunctions } from "helper";
import { RoleService } from "../role/role.service";
import { InstituteService } from "../institutes/institutes.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadService } from "../upload/upload.service";
import { Express } from "express";

import { GetTeachersDto } from "./dtos/get-teachers.dto";
import { DivisionSubjectService } from "../division_subject/divisionsubject.service";
import { SocketGateway } from "../calendar_event/event.gateway";
import { AuditLogService } from "../audit_log/audit-log.service";
import { NotificationService } from "../notification/notification.service";
import { ModuleService } from "../module/module.service";
import { AdminService } from "../admin/admin.service";
import { User } from "../users/user.entity";
import { OBSFileService } from "src/services/obs-file.service";
import { bufferToStream } from "helper/functions";

@Controller("teacher")
@ApiBearerAuth()
@ApiTags("Teacher")
export class TeacherController {
    constructor(
        private teacherService: TeacherService,
        private instituteService: InstituteService,
        private usersService: UsersService,
        private roleService: RoleService,
        private uploadService: UploadService,
        private divisionSubjectService: DivisionSubjectService,
        private socketGateway: SocketGateway,
        private readonly auditLogService: AuditLogService,
        private notificationService: NotificationService,
        private obsService: OBSFileService,
        private moduleServices: ModuleService,
        private adminServices: AdminService
    ) {}

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Post("/create")
    @ApiConsumes("multipart/form-data")
    // @ApiBody({
    //     description: "Admin profile photo and details",
    //     schema: {
    //         type: "object",
    //         properties: {
    //             profile_image: { type: "string", format: "binary" },
    //             first_name: { type: "string" },
    //             last_name: { type: "string" },
    //             email: { type: "string", format: "email" },
    //             mobile_number: { type: "string", example: "+1234567890" },
    //             gender: { type: "string" },
    //             extra_activity: { type: "string" },
    //             date_of_birth: { type: "string", format: "date" },
    //             hire_date: { type: "string" },
    //             school_id: { type: "number" },
    //             cur_batch_id: { type: "number" },
    //             sace_number: { type: "number" },
    //             persal_number: { type: "number" },
    //         },
    //     },
    // })
    @ApiOperation({ summary: "Create Admin and upload profile photo" })
    @ApiResponse({ status: 200, description: "Admin created successfully with profile photo URL" })
    @ApiResponse({ status: 400, description: "No file uploaded or admin already exists" })
    @ApiResponse({ status: 500, description: "Internal server error" })
    @UseInterceptors(FileInterceptor("profile_image"))
    async createTeacher(@Body() createTeacherDto: CreateTeacherDto, @UploadedFile() profile_image: Express.Multer.File, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            if (req.user.institute_id) {
                createTeacherDto["school_id"] = req.user.institute_id;
            } else {
                if (!createTeacherDto.school_id) {
                    return commonResponse.error(languageCode, res, "SCHOOL_REQUIRED", 409, {});
                }
            }
            let teacherRole = await this.roleService.getRoleByInfo({ role_name: "teacher" });
            if (teacherRole && teacherRole.id) {
                createTeacherDto["role_id"] = teacherRole.id;
            }
            const role_name = teacherRole ? teacherRole.role_name : "teacher";

            let first_name = createTeacherDto.first_name;
            let last_name = createTeacherDto.last_name;
            let checkExistuser = await this.usersService.isExist({ email: createTeacherDto.email });
            if (checkExistuser) {
                return commonResponse.error(languageCode, res, "USER_EXIST", 409, {});
            }

            let instituteInfo = await this.instituteService.getInstituteById(createTeacherDto.school_id);
            if (instituteInfo.school_type == "public") {
                if (!createTeacherDto?.persal_number && createTeacherDto?.persal_number == "") {
                    return commonResponse.error(languageCode, res, "PERSAL_NUMBER_REQUIRED", 400, {});
                }
            }

            if (instituteInfo.school_type == "private") {
                if (createTeacherDto?.persal_number) {
                    delete createTeacherDto?.persal_number;
                }
            }

            let school_name = instituteInfo?.school_name;
            let userPayload = {
                ...createTeacherDto,
                first_name: createTeacherDto.first_name,
                last_name: createTeacherDto.last_name,
                user_name: createTeacherDto.first_name,
                status: "pending",
                district_id: instituteInfo?.district_id,
                province_id: instituteInfo?.province_id,
                school_id: instituteInfo?.id,
                created_by: req.user.userId,
            };

            // let current_users = Number(instituteInfo.current_users) + 1;
            // if (current_users > Number(instituteInfo.max_users)) {
            //     let socketPayload = {
            //         title: "teacher",
            //         message: "The user limit has been reached. You cannot add more users at this time.",
            //         school_id: instituteInfo.id,
            //         created_by: instituteInfo.created_by,
            //     };
            //     this.socketGateway.emitToAdminsAndSuperAdmins(socketPayload);
            //     return commonResponse.error("en", res, "USER_LIMIT_END", 409, {});
            // }
            let current_users = Number(instituteInfo.current_users); // Add 1 to current users
            let totalUsers = current_users; // Set totalUsers to current_users + 1
            let maxUsers = Number(instituteInfo.max_users); // Max users in the institute

            let percentage = (totalUsers / maxUsers) * 100; // Calculate percentage

            console.log(`Checking totalUsers: ${totalUsers}, maxUsers: ${maxUsers}, percentage: ${percentage}%`);
            console.log("About to check percentage:", percentage);
            let module = await this.moduleServices.findModuleByNameShow("teachers");
            let schoolAdmin = await this.adminServices.getAdminByObj({ school_id: instituteInfo.id });
            let superAdminRole = await this.roleService.getRoleByInfo({ role_name: "super_admin" });
            let superAdmin: User;
            if (superAdminRole) {
                superAdmin = await this.usersService.findUserByRole(superAdminRole.id);
            }
            if (current_users >= maxUsers) {
                let socketPayload = {
                    title: "teacher",
                    message: "The user limit has been reached. You cannot add more users at this time.",
                    school_id: instituteInfo.id,
                    created_by: instituteInfo.created_by,
                    module_id: module.id,
                };

                // To Admin
                socketPayload["to_user_id"] = schoolAdmin.school_admin_user_id;
                let toNotificationToAdmin = await this.notificationService.createNotification(socketPayload);
                console.log("🚀 ~ NOTIFICATION TO ADMIN", toNotificationToAdmin);
                // To Super Admin
                socketPayload["to_user_id"] = superAdmin.id;
                let toNotificationToSuperAdmin = await this.notificationService.createNotification(socketPayload);
                console.log("🚀 ~ NOTIFICATION TO SUPER ADMIN", toNotificationToSuperAdmin);
                this.socketGateway.commonNotificationForAllModule(instituteInfo.id);
                return commonResponse.error(languageCode, res, "USER_LIMIT_END", 409, {});
            }
            if (percentage >= 90 && percentage < 100) {
                console.log(`Percentage is between 90% and 100%: ${percentage}`);
                let message = `Warning: The number of users in the school "${instituteInfo.school_name}" has reached 90% of the maximum capacity.`;
                await this.notificationService.sendEmailToAdminsAndSuperAdmins(createTeacherDto.school_id, message, "90%", totalUsers, maxUsers);

                // Managing module and send to user
                let socketPayload = {
                    title: "teacher",
                    message: message,
                    school_id: instituteInfo.id,
                    created_by: instituteInfo.created_by,
                    module_id: module.id,
                };
                // To Admin
                socketPayload["to_user_id"] = schoolAdmin.school_admin_user_id;
                let toNotificationToAdmin = await this.notificationService.createNotification(socketPayload);
                console.log("🚀 ~ NOTIFICATION TO ADMIN", toNotificationToAdmin);
                // To Super Admin
                socketPayload["to_user_id"] = superAdmin.id;
                let toNotificationToSuperAdmin = await this.notificationService.createNotification(socketPayload);
                console.log("🚀 ~ NOTIFICATION TO SUPER ADMIN", toNotificationToSuperAdmin);
                this.socketGateway.commonNotificationForAllModule(instituteInfo.id);
            }

            if (percentage >= 100) {
                console.log(`Percentage is 100% or more: ${percentage}`);
                let message = `Alert: The number of users in the school "${instituteInfo.school_name}" has reached 100% of the maximum capacity.`;
                await this.notificationService.sendEmailToAdminsAndSuperAdmins(createTeacherDto.school_id, message, "100%", totalUsers, maxUsers);

                let socketPayload = {
                    title: "teacher",
                    message: message,
                    school_id: instituteInfo.id,
                    created_by: instituteInfo.created_by,
                    module_id: module.id,
                };
                // To Admin
                socketPayload["to_user_id"] = schoolAdmin.school_admin_user_id;
                let toNotificationToAdmin = await this.notificationService.createNotification(socketPayload);
                console.log("🚀 ~ NOTIFICATION TO ADMIN", toNotificationToAdmin);
                // To Super Admin
                socketPayload["to_user_id"] = superAdmin.id;
                let toNotificationToSuperAdmin = await this.notificationService.createNotification(socketPayload);
                console.log("🚀 ~ NOTIFICATION TO SUPER ADMIN", toNotificationToSuperAdmin);
                this.socketGateway.commonNotificationForAllModule(instituteInfo.id);
                // if (current_users > maxUsers) {
                //     socketPayload = {
                //         title: "teacher",
                //         message: "The user limit has been reached. You cannot add more users at this time.",
                //         school_id: instituteInfo.id,
                //         created_by: instituteInfo.created_by,
                //     };
                //     this.socketGateway.emitToAdminsAndSuperAdmins(socketPayload);

                //     return commonResponse.error("en", res, "USER_LIMIT_END", 409, {});
                // }
            }
            if (profile_image) {
                // const fileUrl = await this.uploadService.uploadFile(profile_image);
                const directoryPath = "uploads/profile-pic/teacher";

                const objectKey = `${directoryPath}/${Date.now()}-${profile_image.originalname}`;

                const fileStream = bufferToStream(profile_image.buffer);

                await this.obsService.uploadObject(objectKey, fileStream, profile_image.mimetype);
                createTeacherDto.profile_image = objectKey;

                userPayload["profile_photo_url"] = objectKey;
            }

            let checkExist = await this.teacherService.isExist({ email: createTeacherDto.email, school_id: createTeacherDto.school_id });
            if (checkExist) {
                return commonResponse.error(languageCode, res, "TEACHER_ALREADY_EXISTS", 400, {});
            }

            let user = await this.usersService.create(userPayload);
            createTeacherDto["teacher_user_id"] = user.id;
            createTeacherDto["created_by"] = req.user.userId;

            let create = await this.teacherService.createTeacher(createTeacherDto);
            if (create) {
                let id = instituteInfo.id;
                delete instituteInfo.id;
                current_users = current_users + 1;
                let updatePayload = { ...instituteInfo, current_users: current_users };
                this.instituteService.updateInstitute(id, updatePayload);
                this.usersService.sendWelComeEmail(createTeacherDto.email, user.id, role_name, first_name, last_name, school_name);
                this.usersService.verifyEmail(createTeacherDto.email, user.id);

                this.auditLogService.create({
                    action: "CREATE",
                    message: `Teacher ${create.first_name} ${create.last_name} created.`,
                    old_data: null,
                    new_data: create,
                    action_user_id: req.user.userId,
                    role_id: create.role_id,

                    school_id: create.school_id,
                });

                return commonResponse.success(languageCode, res, "TEACHER_CREATED", 200, {
                    teacher: create,
                    profile_photo_url: userPayload["profile_photo_url"],
                });
            } else {
                return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
            }
        } catch (error) {
            console.log("createTeacherError", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Get("/list")
    @ApiQuery({ name: "sort", required: false, type: String, example: "asc", description: "Sort order (asc/desc)" })
    @ApiQuery({ name: "limit", required: false, type: Number, example: 10, description: "Limit the number of results" })
    @ApiQuery({ name: "page", required: false, type: Number, example: 1, description: "Page number for pagination" })
    @ApiQuery({ name: "search", required: false, type: String, example: "Name", description: "Search by name" })
    @ApiQuery({ name: "batch_id", required: false, type: Number, example: 1, description: "Filter by batch_id" })
    @ApiQuery({ name: "school_id", required: false, type: Number, example: 1, description: "Filter by school_id" })
    @ApiQuery({
        name: "sortField",
        required: false,
        type: String,
        enum: ["first_name", "last_name", "created_at"],
        example: "created_at",
    })
    async getTeachers(@Req() req, @Res() res, @Query() query: any) {
        const languageCode = req.headers["language_code"];
        try {
            if (req.user.institute_id) {
                query["school_id"] = req.user.institute_id;
            }
            const response = await this.teacherService.getTeachers(query);

            if (response && response?.list) {
                for (let teacher of response.list) {
                    if (teacher?.profile_image) {
                        const expiresIn = parseInt(process.env.SIGNATURE_EXPIRY); // Link valid for 1 hour
                        teacher.profile_image = await this.obsService.getObject(teacher.profile_image, expiresIn);
                    } else {
                        teacher.profile_image = DEFAULT_AVTAR.DEFAULT_IMAGE;
                    }
                }

                return commonResponse.success(languageCode, res, "TEACHER_LIST", 200, response);
            } else {
                return commonResponse.error(languageCode, res, "TEACHER_LIST_ERROR", 400, {});
            }
        } catch (error) {
            console.log("errorerrorerrorerror", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Get(":id")
    @ApiParam({ name: "id", required: true, type: Number, example: 1, description: "Teacher ID" })
    async getTeacherById(@Param("id") id: number, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            let teacherDetails = await this.teacherService.getTeacherById(id);
            if (teacherDetails) {
                let divisionSubjects: unknown = [];
                if (teacherDetails.cur_batch_id) {
                    let response = await this.divisionSubjectService.findAll({
                        teacher_id: teacherDetails.id,
                        batch_id: teacherDetails.cur_batch_id,
                    });
                    if (response && response.list) {
                        divisionSubjects = response.list;
                    }
                }
                if (teacherDetails?.profile_image) {
                    teacherDetails.profile_image = await this.obsService.getObject(teacherDetails.profile_image);
                } else {
                    teacherDetails.profile_image = DEFAULT_AVTAR.DEFAULT_IMAGE;
                }

                return commonResponse.success(languageCode, res, "TEACHER_DETAILS", 200, { ...teacherDetails, divisionSubjects: divisionSubjects });
            } else {
                return commonResponse.error(languageCode, res, "TEACHER_NOT_FOUND", 400, {});
            }
        } catch (error) {
            console.log("GetByTeacherByID", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Patch("patch/:id")
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        description: "Admin profile photo and details",
        schema: {
            type: "object",
            properties: {
                profile_image: { type: "string", format: "binary" },
                first_name: { type: "string" },
                last_name: { type: "string" },
                email: { type: "string", format: "email" },
                mobile_number: { type: "string", example: "+1234567890" },
                gender: { type: "string" },
                date_of_birth: { type: "string", format: "date" },
                hire_date: { type: "string" },
                school_id: { type: "number" },
                extra_activity: { type: "string" },
                persal_number: { type: "string", nullable: true },
                sace_number: { type: "string", nullable: true },
            },
        },
    })
    @UseInterceptors(FileInterceptor("profile_image"))
    @ApiParam({ name: "id", required: true, type: Number, example: 1, description: "Teacher ID" })
    async updateTeacher(
        @Param("id") id: number,
        @Body() updateTeacherDto: UpdateTeacherDto,
        @UploadedFile() profile_image: Express.Multer.File,
        @Req() req,
        @Res() res
    ) {
        const languageCode = req.headers["language_code"];
        try {
            let checkExist = await this.teacherService.isExist({ id: id });
            if (!checkExist) {
                return commonResponse.error(languageCode, res, "TEACHER_NOT_FOUND", 400, {});
            }

            let oldAdmin = { ...checkExist };

            if (profile_image) {
                if (checkExist && checkExist.profile_image !== null) {
                    await this.uploadService.deleteFile(checkExist.profile_image);
                }

                // Ensure the directory exists and then upload the profile image
                const directoryPath = "uploads/profile-pic/teacher";

                console.log("🚀 ~ file: teacher.controller.ts:351 ~ TeacherController ~ profile_image:", profile_image);

                const objectKey = `${directoryPath}/${Date.now()}-${profile_image.originalname}`;

                const fileStream = bufferToStream(profile_image.buffer);

                await this.obsService.uploadObject(objectKey, fileStream, profile_image.mimetype);

                updateTeacherDto.profile_image = objectKey;
            }

            let updateTeacher = await this.teacherService.updateTeacher(id, updateTeacherDto);
            if (updateTeacher) {
                let instituteInfo = await this.instituteService.getInstituteById(updateTeacher.school_id);
                let userUpdatePayload = {
                    ...updateTeacher,

                    first_name: updateTeacher.first_name,
                    last_name: updateTeacher.last_name,

                    district_id: instituteInfo?.district_id,
                    province_id: instituteInfo?.province_id,
                    school_id: instituteInfo?.id,
                };
                delete userUpdatePayload.id;

                delete userUpdatePayload.teacher_user_id;
                await this.usersService.updateUser(updateTeacher.teacher_user_id, userUpdatePayload);

                const updatedTeacher = await this.teacherService.updateTeacher(id, updateTeacherDto);
                await this.auditLogService.create({
                    action: "UPDATE",
                    message: `Teacher ${updatedTeacher.first_name} ${updatedTeacher.last_name} updated.`,
                    old_data: oldAdmin,
                    new_data: updatedTeacher,
                    action_user_id: req.user.userId,
                    role_id: updatedTeacher.role_id,

                    school_id: updatedTeacher.school_id,
                });

                return commonResponse.success(languageCode, res, "TEACHER_UPDATED_SUCCESS", 200, updateTeacher);
            } else {
                return commonResponse.error(languageCode, res, "TEACHER_UPDATE_ERROR", 400, {});
            }
        } catch (error) {
            console.log("teacher patch", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Delete("delete/:id")
    @ApiParam({ name: "id", required: true, type: Number, example: 1, description: "Teacher ID" })
    async deleteTeacher(@Param("id") id: number, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            let checkExist = await this.teacherService.isExist({ id: id });

            if (!checkExist) {
                return commonResponse.error(languageCode, res, "TEACHER_NOT_FOUND", 404, {});
            }

            let fetchAllClassSubject = await this.divisionSubjectService.getDivisionSubjectByQuery({
                teacher_id: checkExist.id,
                batch_id: checkExist.cur_batch_id,
            });
            let classSubjectIds = fetchAllClassSubject.map((data) => data.id);
            if (fetchAllClassSubject?.length) {
                // fetch all Associated students
                let associateStudent = await this.divisionSubjectService.findAssociateStudents(classSubjectIds);
                if (associateStudent?.length) {
                    return commonResponse.error(languageCode, res, "YOU_CANNOT_DELETE_THIS_TEACHER", 400, {});
                }
            }
            const oldData = { ...checkExist };
            await this.teacherService.deleteTeacher(id);

            fetchAllClassSubject = fetchAllClassSubject.map((data) => {
                data["deleted_at"] = new Date();
                data["deleted_by"] = req.user.userId;
                return data;
            });
            await this.divisionSubjectService.softDeleteDivisionSubject(fetchAllClassSubject);
            // await this.usersService.deleteUser(Number(checkExist.teacher_user_id));
            const auditLogData = {
                action: "DELETE",
                message: `Teacher ${checkExist.first_name} ${checkExist.last_name} deleted.`,
                old_data: oldData,
                new_data: null,
                action_user_id: req.user.userId,

                role_id: checkExist.role_id,
                school_id: checkExist.school_id,
            };
            this.auditLogService.create(auditLogData);

            return commonResponse.success(languageCode, res, "TEACHER_DELETED_SUCCESS", 200, {});
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Get("/teacher-assign-subject/:id")
    @ApiParam({
        name: "id",
        required: true,
        type: Number,
        example: 1,
        description: "Teacher ID",
    })
    @ApiQuery({ name: "batch_id", required: true, type: Number, example: 1, description: "Filter by batch_id" })
    async getTeacherAssignSubject(@Param("id") id: number, @Req() req: any, @Res() res: any, @Query() query: any) {
        const languageCode = req.headers["language_code"];
        try {
            let teacherDetails = await this.teacherService.getTeacherByQuery({ id: id });
            if (teacherDetails) {
                query.teacher_id = teacherDetails.id;
                query.batch_id = query.batch_id || teacherDetails.cur_batch_id;
                query["forTeacher"] = true;
                let response = await this.divisionSubjectService.findAll(query);
                let newResponse = {
                    totalCount: 0,
                    totalPages: 0,
                    currentPage: 0,
                    list: [],
                };
                if (response?.list?.length) {
                    let list = response.list
                        .map(({ id, master_subject, grade, division }) => ({
                            id,
                            subject_name: master_subject?.subject_name || "",
                            subject_code: master_subject?.subject_code || 0,
                            grade_number: grade?.grade_number || 0,
                            division: division?.name || "",
                        }))
                        .sort((a, b) => (a.grade_number !== b.grade_number ? a.grade_number - b.grade_number : a.division.localeCompare(b.division)));

                    const page = query.page ? parseInt(query.page, 10) : 1;
                    const limit = query.limit ? parseInt(query.limit, 10) : 10;
                    const offset = (page - 1) * limit;

                    const paginatedSubjects = list.slice(offset, offset + limit);
                    const totalCount = list.length;
                    const totalPages = limit > 0 ? Math.ceil(totalCount / limit) : 1;

                    newResponse.totalCount = totalCount;
                    newResponse.totalPages = totalPages;
                    newResponse.currentPage = page;
                    newResponse.list = paginatedSubjects;
                }

                return commonResponse.success(languageCode, res, "TEACHER_DETAILS", 200, newResponse);
            } else {
                return commonResponse.error(languageCode, res, "TEACHER_NOT_FOUND", 400, {});
            }
        } catch (error) {
            console.log("GetByTeacherByID", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }
}
