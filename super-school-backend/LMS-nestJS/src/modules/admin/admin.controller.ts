import { Controller, Get, Post, Body, Param, Patch, Req, Res, Delete, Query, UseGuards, UseInterceptors, UploadedFile } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { commonResponse } from "helper";
import { CreateAdminDto } from "./dtos/create-admin.dto";
import { UpdateAdminDto } from "./dtos/update-admin.dto";
import { Admin } from "./admin.entity";
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
import { SocketGateway } from "../calendar_event/event.gateway";
import { AuditLogService } from "../audit_log/audit-log.service";
import { NotificationService } from "../notification/notification.service";
import { ModuleService } from "../module/module.service";
import { User } from "../users/user.entity";
import { OBSFileService } from "src/services/obs-file.service";
import { bufferToStream } from "helper/functions";

@Controller("admin")
@ApiBearerAuth()
@ApiTags("Admin")
export class AdminController {
    constructor(
        private adminService: AdminService,
        private instituteService: InstituteService,
        private usersService: UsersService,
        private roleService: RoleService,
        private uploadService: UploadService,
        private socketGateway: SocketGateway,
        private readonly auditLogService: AuditLogService,
        private notificationService: NotificationService,
        private moduleServices: ModuleService,
        private obsService: OBSFileService
    ) {}

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Post("/create")
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
                school_id: { type: "number" },
            },
        },
    })
    @ApiOperation({ summary: "Create Admin and upload profile photo" })
    @ApiResponse({ status: 200, description: "Admin created successfully with profile photo URL" })
    @ApiResponse({ status: 400, description: "No file uploaded or admin already exists" })
    @ApiResponse({ status: 500, description: "Internal server error" })
    @UseInterceptors(FileInterceptor("profile_image"))
    async createAdmin(@Body() createAdminDto: CreateAdminDto, @UploadedFile() profile_image: Express.Multer.File, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            if (req.user.institute_id) {
                createAdminDto["school_id"] = req.user.institute_id;
            } else {
                if (!createAdminDto.school_id) {
                    return commonResponse.error(languageCode, res, "SCHOOL_REQUIRED", 409, {});
                }
            }
            let adminRole = await this.roleService.getRoleByInfo({ role_name: "admin" });

            if (adminRole && adminRole.id) {
                createAdminDto["role_id"] = Number(adminRole.id);
            }

            let creatorRole = await this.usersService.findById(req.user.userId);

            const role_name = adminRole ? adminRole.role_name : "admin";
            let first_name = createAdminDto.first_name;
            let last_name = createAdminDto.last_name;

            let checkExistuser = await this.usersService.isExist({ email: createAdminDto.email });
            if (checkExistuser) {
                return commonResponse.error(languageCode, res, "ADMIN_ALREADY_EXISTS", 409, {});
            }

            let checkExist = await this.adminService.isExist({ email: createAdminDto.email });
            if (checkExist) {
                return commonResponse.error(languageCode, res, "ADMIN_ALREADY_EXISTS", 409, {});
            }

            let instituteInfo = await this.instituteService.getInstituteById(createAdminDto.school_id);
            let school_name = instituteInfo?.school_name;
            let userPayload = {
                ...createAdminDto,
                first_name: createAdminDto.first_name,
                last_name: createAdminDto.last_name,
                user_name: createAdminDto.first_name,
                status: "pending",
                district_id: instituteInfo?.district_id,
                province_id: instituteInfo?.province_id,
                school_id: instituteInfo?.id,
                created_by: req.user.userId,
                updated_by: req.user.userId,
            };

            // let current_users = Number(instituteInfo.current_users) + 1;
            // let totalUsers = Number(instituteInfo.current_users); // Assuming this is the current count of users
            // let maxUsers = Number(instituteInfo.max_users);
            // let percentage = (totalUsers / maxUsers) * 100;
            // if (current_users > Number(instituteInfo.max_users)) {
            //     let socketPayload = {
            //         title: "admin",
            //         message: "The user limit has been reached. You cannot add more users at this time.",
            //         school_id: instituteInfo.id,
            //         created_by: instituteInfo.created_by,
            //     };
            //     this.socketGateway.emitToAdminsAndSuperAdmins(socketPayload);
            //     this.usersService.sendUserLimitNotification(createAdminDto.email, school_name, totalUsers, maxUsers);
            //     return commonResponse.error("en", res, "USER_LIMIT_END", 409, {});
            // }
            let current_users = Number(instituteInfo.current_users); // Add 1 to current users
            let totalUsers = current_users; // Set totalUsers to current_users + 1
            console.log(`🚀 🚀 <<<<<< ::::: - 🚀 🚀- ::::: >>>>>> ~ totalUsers: `, totalUsers);

            let maxUsers = Number(instituteInfo.max_users); // Max users in the institute
            console.log(`🚀 🚀 <<<<<< ::::: - 🚀 🚀- ::::: >>>>>> ~ maxUsers: `, maxUsers);

            let percentage = (totalUsers / maxUsers) * 100; // Calculate percentage
            console.log(`🚀 🚀 <<<<<< ::::: - 🚀 🚀- ::::: >>>>>> ~ percentage: `, percentage);

            console.log(`Checking totalUsers: ${totalUsers}, maxUsers: ${maxUsers}, percentage: ${percentage}%`);
            console.log("About to check percentage:", percentage);

            let module = await this.moduleServices.findModuleByNameShow("admin");
            let superAdminRole = await this.roleService.getRoleByInfo({ role_name: "super_admin" });
            let superAdmin: User;
            if (superAdminRole) {
                superAdmin = await this.usersService.findUserByRole(superAdminRole.id);
            }
            if (current_users >= maxUsers) {
                let socketPayload = {
                    title: "admin",
                    message: `The user limit has been reached for the "${instituteInfo.school_name}". You cannot add more users at this time.`,
                    school_id: instituteInfo.id,
                    created_by: instituteInfo.created_by,
                    module_id: module.id,
                };
                // this.socketGateway.emitToAdminsAndSuperAdmins(socketPayload);
                this.socketGateway.commonNotificationForAllModule(instituteInfo.id);

                socketPayload["to_user_id"] = superAdmin.id;
                let toNotificationToSuperAdmin = await this.notificationService.createNotification(socketPayload);
                console.log("🚀 ~ NOTIFICATION TO SUPER ADMIN", toNotificationToSuperAdmin);
                // return commonResponse.error("en", res, "USER_LIMIT_END", 409, {});
                return commonResponse.error(languageCode, res, "USER_LIMIT_END", 409, {});
            }

            if (percentage >= 90 && percentage < 100) {
                console.log(`Percentage is between 90% and 100%: ${percentage}`);
                let message = `Warning: The number of users in the school "${instituteInfo.school_name}" has reached 90% of the maximum capacity.`;
                await this.notificationService.sendEmailToAdminsAndSuperAdmins(createAdminDto.school_id, message, "90%", totalUsers, maxUsers);

                let socketPayload = {
                    title: "admin",
                    message: message,
                    school_id: instituteInfo.id,
                    created_by: instituteInfo.created_by,
                    module_id: module.id,
                };
                // this.socketGateway.emitToAdminsAndSuperAdmins(socketPayload);
                this.socketGateway.commonNotificationForAllModule(instituteInfo.id);
                socketPayload["to_user_id"] = superAdmin.id;
                let toNotificationToSuperAdmin = await this.notificationService.createNotification(socketPayload);
                console.log("🚀 ~ NOTIFICATION TO SUPER ADMIN", toNotificationToSuperAdmin);
            }

            if (percentage >= 100) {
                console.log(`Percentage is 100% or more: ${percentage}`);
                let message = `Alert: The number of users in the school "${instituteInfo.school_name}" has reached 100% of the maximum capacity.`;
                await this.notificationService.sendEmailToAdminsAndSuperAdmins(createAdminDto.school_id, message, "100%", totalUsers, maxUsers);

                let socketPayload = {
                    title: "admin",
                    message: message,
                    school_id: instituteInfo.id,
                    created_by: instituteInfo.created_by,
                    module_id: module.id,
                };
                // this.socketGateway.emitToAdminsAndSuperAdmins(socketPayload);
                this.socketGateway.commonNotificationForAllModule(instituteInfo.id);
                socketPayload["to_user_id"] = superAdmin.id;
                let toNotificationToSuperAdmin = await this.notificationService.createNotification(socketPayload);
                console.log("🚀 ~ NOTIFICATION TO SUPER ADMIN", toNotificationToSuperAdmin);

                // if (current_users > maxUsers) {
                //     socketPayload = {
                //         title: "admin",
                //         message: "The user limit has been reached. You cannot add more users at this time.",
                //         school_id: instituteInfo.id,
                //         created_by: instituteInfo.created_by,
                //     };
                //     this.socketGateway.emitToAdminsAndSuperAdmins(socketPayload);

                //     return commonResponse.error("en", res, "USER_LIMIT_END", 409, {});
                // }
            }

            createAdminDto["created_by"] = req.user.userId;

            if (profile_image) {
                const directoryPath = "uploads/profile-pic/admin";

                const objectKey = `${directoryPath}/${Date.now()}-${profile_image.originalname}`;

                const fileStream = bufferToStream(profile_image.buffer);

                await this.obsService.uploadObject(objectKey, fileStream, profile_image.mimetype);
                createAdminDto.profile_image = objectKey;

                userPayload["profile_photo_url"] = objectKey;
            }

            let user = await this.usersService.create(userPayload);

            createAdminDto["school_admin_user_id"] = user.id;
            let create = await this.adminService.createAdmin(createAdminDto);
            let auditLogMessage = "";

            if (creatorRole.role.role_name == "super_admin") {
                auditLogMessage = `A new admin named "${create.first_name} ${create.last_name}" has been created by super admin "${creatorRole.user_name}".`;
            }

            if (create) {
                let id = instituteInfo.id;
                delete instituteInfo.id;
                let updatePayload = { ...instituteInfo, current_users: current_users };
                this.instituteService.updateInstitute(id, updatePayload);

                this.usersService.sendWelComeEmail(createAdminDto.email, user.id, role_name, first_name, last_name, school_name);
                this.usersService.verifyEmail(createAdminDto.email, user.id);

                let auditlog = this.auditLogService.create({
                    action: "CREATE",
                    message: auditLogMessage,
                    old_data: null,
                    new_data: create,
                    action_user_id: req.user.userId,
                    role_id: create.role_id,
                    school_id: create.school_id,
                });
                if (auditlog) {
                    console.log("🚀 ~ AdminController ~ createAdmin ~ auditlog:=============", auditlog);
                }

                return commonResponse.success(languageCode, res, "ADMIN_CREATED", 200, {
                    admin: create,
                    profile_photo_url: userPayload["profile_photo_url"],
                });
            } else {
                return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
            }
        } catch (error) {
            console.log("createAdminError", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Get("/list")
    @ApiQuery({ name: "sort", required: false, type: String, example: "asc", description: "Sort order (asc/desc)" })
    @ApiQuery({ name: "limit", required: false, type: Number, example: 10, description: "Limit the number of results" })
    @ApiQuery({ name: "page", required: false, type: Number, example: 1, description: "Page number for pagination" })
    @ApiQuery({ name: "school_id", required: false, type: Number, example: 1 })
    @ApiQuery({ name: "search", required: false, type: String, example: "Name", description: "Search by name" })
    @ApiQuery({
        name: "sortField",
        required: false,
        type: String,
        enum: ["first_name", "last_name", "created_at"],
        example: "created_at",
    })
    async getAdmins(@Req() req, @Res() res, @Query() query: any) {
        const languageCode = req.headers["language_code"];
        try {
            if (req.user.institute_id) {
                query["school_id"] = req.user.institute_id;
            }
            const result = await this.adminService.getAdmins(query);
            if (result && result?.list) {
                for (let admin of result.list) {
                    if (admin?.profile_image) {
                        const expiresIn = parseInt(process.env.SIGNATURE_EXPIRY); // Link valid for 1 hour
                        admin.profile_image = await this.obsService.getObject(admin.profile_image, expiresIn);
                    } else {
                        admin.profile_image = DEFAULT_AVTAR.DEFAULT_IMAGE;
                    }
                }
                return commonResponse.success(languageCode, res, "ADMIN_LIST", 200, result);
            } else {
                return commonResponse.error(languageCode, res, "ADMIN_LIST_ERROR", 400, {});
            }
        } catch (error) {
            console.log("admin list", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Get(":id")
    @ApiParam({ name: "id", required: true, type: Number, example: 1, description: "Admin ID" })
    async getAdminById(@Param("id") id: number, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            let adminDetails = await this.adminService.getAdminById(id);
            if (adminDetails) {
                // adminDetails.profile_image = process.env.API_SERVER_PATH + "/profile/" + adminDetails.profile_image;
                const expiresIn = parseInt(process.env.SIGNATURE_EXPIRY); // Link valid for 1 hour
                if (adminDetails?.profile_image) {
                    adminDetails.profile_image = await this.obsService.getObject(adminDetails.profile_image, expiresIn);
                } else {
                    adminDetails.profile_image = DEFAULT_AVTAR.DEFAULT_IMAGE;
                }

                return commonResponse.success(languageCode, res, "ADMIN_DETAILS", 200, adminDetails);
            } else {
                return commonResponse.error(languageCode, res, "ADMIN_NOT_FOUND", 400, {});
            }
        } catch (error) {
            console.log("admin by id", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
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
                school_id: { type: "number" },
            },
        },
    })
    @ApiOperation({ summary: "Create Admin and upload profile photo" })
    @ApiResponse({ status: 200, description: "Admin created successfully with profile photo URL" })
    @ApiResponse({ status: 400, description: "No file uploaded or admin already exists" })
    @ApiResponse({ status: 500, description: "Internal server error" })
    @UseInterceptors(FileInterceptor("profile_image"))
    @ApiParam({ name: "id", required: true, type: Number, example: 1, description: "Admin ID" })
    async updateAdmin(
        @Param("id") id: number,
        @Body() updateAdminDto: UpdateAdminDto,
        @UploadedFile() profile_image: Express.Multer.File,
        @Req() req,
        @Res() res
    ) {
        const languageCode = req.headers["language_code"];
        try {
            let checkExist = await this.adminService.isExist({ id: id });
            if (!checkExist) {
                return commonResponse.error(languageCode, res, "ADMIN_NOT_FOUND", 400, {});
            }
            // Fetch the old admin data before updating it
            let oldAdmin = { ...checkExist };
            if (profile_image) {
                if (checkExist && checkExist.profile_image !== null) {
                    await this.obsService.deleteObject(checkExist.profile_image);
                }
                const directoryPath = "uploads/profile-pic/admin";

                const objectKey = `${directoryPath}/${Date.now()}-${profile_image.originalname}`;

                const fileStream = bufferToStream(profile_image.buffer);

                await this.obsService.uploadObject(objectKey, fileStream, profile_image.mimetype);
                updateAdminDto.profile_image = objectKey;
            }
            let creatorRole = await this.usersService.findById(req.user.userId);
            let updateAdmin = await this.adminService.updateAdmin(id, updateAdminDto);

            let auditLogMessage = "";

            if (creatorRole.role.role_name == "super_admin") {
                auditLogMessage = `The admin named "${updateAdmin.first_name} ${updateAdmin.last_name}" has been updated by super admin "${creatorRole.user_name}".`;
            } else {
                auditLogMessage = `The admin named "${updateAdmin?.first_name} ${updateAdmin?.last_name}" has been updated by "${creatorRole?.user_name}" with role "${creatorRole?.role?.role_name}".`;
            }
            if (updateAdmin) {
                // let instituteInfo = await this.instituteService.getInstituteById(updateAdmin.school_id);
                let instituteInfo = await this.instituteService.getInstituteById(updateAdmin.institute.id);

                let userUpdatePayload = {
                    ...updateAdmin,
                    first_name: updateAdmin.first_name,
                    last_name: updateAdmin.last_name,
                    updated_by: req.user.userId,
                    district_id: instituteInfo?.district_id,
                    province_id: instituteInfo?.province_id,
                    school_id: instituteInfo?.id,
                };

                delete userUpdatePayload.id;

                delete userUpdatePayload.school_admin_user_id;
                await this.usersService.updateUser(updateAdmin.school_admin_user_id, userUpdatePayload);

                const updatedAdmin = await this.adminService.updateAdmin(id, updateAdminDto);

                await this.auditLogService.create({
                    action: "UPDATE",
                    message: auditLogMessage,
                    old_data: oldAdmin,
                    new_data: updatedAdmin,
                    action_user_id: req.user.userId,
                    role_id: updatedAdmin.role_id,
                    school_id: updatedAdmin.school_id,
                });

                return commonResponse.success(languageCode, res, "ADMIN_UPDATED_SUCCESS", 200, updateAdmin);
            } else {
                return commonResponse.error(languageCode, res, "ADMIN_UPDATE_ERROR", 400, {});
            }
        } catch (error) {
            console.log("🚀 ~ file: admin.controller.ts:371 ~ AdminController ~ error:", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Delete("delete/:id")
    @ApiParam({ name: "id", required: true, type: Number, example: 1, description: "Admin ID" })
    async deleteAdmin(@Param("id") id: number, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            let checkExist = await this.adminService.isExist({ id: id });
            let creatorRole = await this.usersService.findById(req.user.userId);
            let auditLogMessage = "";

            if (!checkExist) {
                return commonResponse.error(languageCode, res, "ADMIN_NOT_FOUND", 404, {});
            }

            const oldData = { ...checkExist };

            let response = await this.adminService.deleteAdmin(id);

            if (response && response.school_admin_user_id) {
                await this.usersService.deleteUser(Number(response.school_admin_user_id));
            }

            if (creatorRole.role.role_name == ROLE.MASTER_ADMIN) {
                auditLogMessage = `The admin "${checkExist.first_name} ${checkExist.last_name}" has been deleted by super admin "${creatorRole.user_name}".`;
            } else {
                auditLogMessage = `The admin "${checkExist.first_name} ${checkExist.last_name}" has been deleted by "${creatorRole?.user_name}" with role "${creatorRole?.role?.role_name}".`;
            }
            let notificationPayload = {
                title: "Admin",
                message: auditLogMessage,
                school_id: checkExist.school_id,
                created_by: req.user.userId,
                module_id: module.id,
            };
            const auditLogData = {
                action: "DELETE",
                message: auditLogMessage,
                old_data: oldData,
                new_data: null,
                action_user_id: req.user.userId,
                role_id: checkExist.role_id,
                school_id: checkExist.school_id,
            };
            let audit = await this.auditLogService.create(auditLogData);
            this.socketGateway.commonNotificationForAllModule(checkExist.school_id);
            console.log("🚀 ~ AdminController ~ deleteAdmin ~ audit:", audit);

            return commonResponse.success(languageCode, res, "ADMIN_DELETED_SUCCESS", 200, {});
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }
}
