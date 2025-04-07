import { Controller, Post, Get, Param, Patch, Body, Delete, Req, Res, UseGuards, UseInterceptors, Query, UploadedFile } from "@nestjs/common";
import { DepartmentUserService } from "./department_user.service";
import { CreateDepartmentUserDto } from "./dtos/create-department-user.dto";
import { UpdateDepartmentUserDto } from "./dtos/update-department-user.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

import { ApiOperation, ApiResponse, ApiParam, ApiBody, ApiConsumes, ApiQuery, ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { commonResponse } from "helper";

import { Roles } from "src/decorator/role_decorator";
import { DEFAULT_AVTAR, ROLE } from "helper/constants";
import { FileInterceptor } from "@nestjs/platform-express";
import { AuditLogService } from "../audit_log/audit-log.service";
import { UploadService } from "../upload/upload.service";
import { UsersService } from "../users/user.service";
import { RoleService } from "../role/role.service";
import { OBSFileService } from "src/services/obs-file.service";
import { bufferToStream } from "helper/functions";

@Controller("department-user")
@ApiBearerAuth()
@ApiTags("Department-User")
export class DepartmentUserController {
    constructor(
        private readonly departmentUserService: DepartmentUserService,
        private readonly auditLogService: AuditLogService,
        private uploadService: UploadService,
        private usersService: UsersService,
        private roleService: RoleService,
        private obsService: OBSFileService
    ) {}

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN)
    @Post("/create")
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        description: "Department user profile photo and details",
        schema: {
            type: "object",
            properties: {
                profile_image: { type: "string", format: "binary" },
                first_name: { type: "string" },
                last_name: { type: "string" },
                email: { type: "string", format: "email" },
                mobile_number: { type: "string", example: "+1234567890" },
                job_title: { type: "string" },
                district_id: { type: "number" },
                province_id: { type: "number" },
            },
        },
    })
    @ApiOperation({ summary: "Create Department User and upload profile photo" })
    @ApiResponse({ status: 200, description: "Department user created successfully with profile photo URL" })
    @ApiResponse({ status: 400, description: "No file uploaded or department user already exists" })
    @ApiResponse({ status: 500, description: "Internal server error" })
    @UseInterceptors(FileInterceptor("profile_image"))
    async createDepartmentUser(
        @Body() createDepartmentUserDto: CreateDepartmentUserDto,
        @UploadedFile() profile_image: Express.Multer.File,
        @Req() req,
        @Res() res
    ) {
        const languageCode = req.headers["language_code"];
        try {
            let departmentRole = await this.roleService.getRoleByInfo({ role_name: "department_of_education" });

            if (departmentRole && departmentRole.id) {
                createDepartmentUserDto["role_id"] = Number(departmentRole.id);
            }

            let checkExistuser = await this.departmentUserService.isExist({ email: createDepartmentUserDto.email });
            if (checkExistuser) {
                return commonResponse.error(languageCode, res, "USER_EXIST", 409, {});
            }

            let checkExist = await this.departmentUserService.isExist({ email: createDepartmentUserDto.email });
            if (checkExist) {
                return commonResponse.error(languageCode, res, "DEPARTMENT_USER_ALREADY_EXISTS", 400, {});
            }
            let userPayload = {
                ...createDepartmentUserDto,
                first_name: createDepartmentUserDto.first_name,
                last_name: createDepartmentUserDto.last_name,
                user_name: createDepartmentUserDto.first_name,
                created_by: req.user.userId,
                updated_by: req.user.userId,
                status: "pending",
            };
            createDepartmentUserDto["created_by"] = req.user.userId;

            if (profile_image) {
                // const fileUrl = await this.uploadService.uploadFile(profile_image);
                const directoryPath = "uploads/profile-pic/department_admin";

                const objectKey = `${directoryPath}/${Date.now()}-${profile_image.originalname}`;

                const fileStream = bufferToStream(profile_image.buffer);

                await this.obsService.uploadObject(objectKey, fileStream, profile_image.mimetype);
                createDepartmentUserDto.profile_image = objectKey;
                userPayload["profile_photo_url"] = objectKey;
            }
            let user = await this.usersService.create(userPayload);
            createDepartmentUserDto["department_user_id"] = user.id;

            let departmentUser = await this.departmentUserService.createDepartmentUser(createDepartmentUserDto);
            if (departmentUser) {
                this.usersService.verifyEmail(createDepartmentUserDto.email, user.id);

                this.auditLogService.create({
                    action: "CREATE",
                    message: `Department user ${departmentUser.first_name} ${departmentUser.last_name} created.`,
                    old_data: null,
                    new_data: departmentUser,
                    action_user_id: req.user.userId,
                    role_id: departmentUser.role_id,
                });

                return commonResponse.success(languageCode, res, "DEPARTMENT_USER_CREATED", 201, {
                    department_user: departmentUser,
                    profile_photo_url: userPayload["profile_photo_url"],
                });
            } else {
                return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
            }
        } catch (error) {
            console.log("createDepartmentUserError", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN)
    @Get("/list")
    @ApiQuery({ name: "sort", required: false, type: String, example: "asc", description: "Sort order (asc/desc)" })
    @ApiQuery({ name: "limit", required: false, type: Number, example: 10, description: "Limit the number of results" })
    @ApiQuery({ name: "page", required: false, type: Number, example: 1, description: "Page number for pagination" })
    @ApiQuery({
        name: "sortField",
        required: false,
        type: String,
        enum: ["first_name", "last_name", "created_at"],
        example: "created_at",
    })
    async getAllDepartmentUsers(@Req() req, @Res() res, @Query() query: any) {
        const languageCode = req.headers["language_code"];
        try {
            const departmentUsers = await this.departmentUserService.AllDepartmentUser(query);

            if (departmentUsers && departmentUsers?.list.length > 0) {
                // departmentUsers.list = departmentUsers.list.map((departmentUsers) => {
                //     if (departmentUsers.profile_image) {
                //         departmentUsers.profile_image = `${process.env.API_SERVER_PATH}/profile/${departmentUsers.profile_image}`;
                //     }
                //     return departmentUsers;
                // });
                for (let departmentAdmin of departmentUsers?.list) {
                    if (departmentAdmin?.profile_image) {
                        const expiresIn = parseInt(process.env.SIGNATURE_EXPIRY); // Link valid for 1 hour
                        departmentAdmin.profile_image = await this.obsService.getObject(departmentAdmin.profile_image, expiresIn);
                    } else {
                        departmentAdmin.profile_image = DEFAULT_AVTAR.DEFAULT_IMAGE;
                    }
                }
                return commonResponse.success(languageCode, res, "DEPARTMENT_USER_LIST", 200, { department_users: departmentUsers });
            } else {
                return commonResponse.error(languageCode, res, "DEPARTMENT_USER_LIST_ERROR", 400, {});
            }
        } catch (error) {
            console.log("department list", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN)
    @Get(":id")
    @ApiParam({ name: "id", required: true, type: Number, description: "Department user ID" })
    @ApiOperation({ summary: "Get a department user by ID" })
    async getDepartmentUserById(@Param("id") id: number, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            const departmentUser = await this.departmentUserService.getDepartmentUserById(id);
            if (departmentUser) {
                // departmentUser.profile_image = process.env.API_SERVER_PATH + "/profile/" + departmentUser.profile_image;
                if (departmentUser?.profile_image) {
                    const expiresIn = parseInt(process.env.SIGNATURE_EXPIRY); // Link valid for 1 hour
                    departmentUser.profile_image = await this.obsService.getObject(departmentUser.profile_image, expiresIn);
                } else {
                    departmentUser.profile_image = DEFAULT_AVTAR.DEFAULT_IMAGE;
                }

                return commonResponse.success(languageCode, res, "DEPARTMENT_USER_DETAILS", 200, { department_user: departmentUser });
            } else {
                return commonResponse.error(languageCode, res, "DEPARTMENT_USER_NOT_FOUND", 404, {});
            }
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }
    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN)
    @Patch("patch/:id")
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        description: "Department user profile photo and details",
        schema: {
            type: "object",
            properties: {
                profile_image: { type: "string", format: "binary" },
                first_name: { type: "string" },
                last_name: { type: "string" },
                email: { type: "string", format: "email" },
                mobile_number: { type: "string", example: "+1234567890" },
                job_title: { type: "string" },
                district_id: { type: "number" },
                province_id: { type: "number" },
            },
        },
    })
    @ApiOperation({ summary: "Update department user information" })
    @ApiResponse({ status: 200, description: "Department created successfully with profile photo URL" })
    @ApiResponse({ status: 400, description: "No file uploaded or department already exists" })
    @ApiResponse({ status: 500, description: "Internal server error" })
    @UseInterceptors(FileInterceptor("profile_image"))
    async updateDepartmentUser(
        @Param("id") id: number,
        @Body() updateDepartmentUserDto: UpdateDepartmentUserDto,
        @UploadedFile() profile_image: Express.Multer.File,
        @Req() req,
        @Res() res
    ) {
        const languageCode = req.headers["language_code"];
        try {
            const existingDepartmentUser = await this.departmentUserService.isExist({ id: id });
            if (!existingDepartmentUser) {
                return commonResponse.error(languageCode, res, "DEPARTMENT_USER_NOT_FOUND", 404, {});
            }
            let oldDepartment = { ...existingDepartmentUser };
            if (profile_image) {
                if (existingDepartmentUser && existingDepartmentUser.profile_image !== null) {
                    await this.uploadService.deleteFile(existingDepartmentUser.profile_image);
                }
                const directoryPath = "uploads/profile-pic/department_admin";
                const objectKey = `${directoryPath}/${Date.now()}-${profile_image.originalname}`;
                const fileStream = bufferToStream(profile_image.buffer);
                await this.obsService.uploadObject(objectKey, fileStream, profile_image.mimetype);

                updateDepartmentUserDto.profile_image = objectKey;
            }
            let updateDepartment = await this.departmentUserService.updateDepartmentUser(id, updateDepartmentUserDto);
            if (!updateDepartment) {
                return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
            }
            delete updateDepartment.id;
            let userUpdatePayload = {
                ...updateDepartment,
                first_name: updateDepartment.first_name,
                last_name: updateDepartment.last_name,
                updated_by: req.user.userId,
            };

            delete userUpdatePayload.department_user_id;
            let updatedRecord = await this.usersService.updateDepartmentUser(updateDepartment.department_user_id, userUpdatePayload);

            this.auditLogService.create({
                action: "UPDATE",
                message: `Department user ${updateDepartmentUserDto.first_name} ${updateDepartmentUserDto.last_name} updated.`,
                old_data: oldDepartment,
                new_data: updateDepartment,
                action_user_id: req.user.userId,
                role_id: updateDepartment.role_id,
            });

            return commonResponse.success(languageCode, res, "DEPARTMENT_USER_UPDATED", 200, updateDepartment);
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN)
    @Delete("delete/:id")
    @ApiParam({ name: "id", required: true, type: Number, description: "Department user ID" })
    @ApiOperation({ summary: "Delete a department user" })
    async deleteDepartmentUser(@Param("id") id: number, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            const existingDepartmentUser = await this.departmentUserService.isExist({ id: id });
            if (!existingDepartmentUser) {
                return commonResponse.error(languageCode, res, "DEPARTMENT_USER_NOT_FOUND", 404, {});
            }

            const oldData = { ...existingDepartmentUser };

            let response = await this.departmentUserService.deleteDepartmentUser(id);
            if (response && response.department_user_id) {
                await this.usersService.deleteUser(Number(response.department_user_id));
            }
            const deletedAt = new Date();

            const auditLogData = {
                action: "DELETE",
                message: `Department user ${existingDepartmentUser.first_name} ${existingDepartmentUser.last_name} deleted.`,
                old_data: oldData,
                new_data: null,
                action_user_id: req.user.userId,
                role_id: existingDepartmentUser.role_id,

                deleted_at: deletedAt,
            };
            await this.auditLogService.create(auditLogData);
            return commonResponse.error(languageCode, res, "DEPARTMENT_USER_DELETE_SUCCESS", 200, {});
        } catch (error) {
            console.log("delete department", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }
}
