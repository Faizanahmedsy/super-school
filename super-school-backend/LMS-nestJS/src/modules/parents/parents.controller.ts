import { Controller, Get, Post, Body, Param, Patch, Req, Res, Delete, Query, UseGuards, UseInterceptors, UploadedFile } from "@nestjs/common";
import { ParentService } from "./parents.service";
import { commonResponse } from "helper";
import { CreateParentDto } from "./dtos/create-parents.dto";
import { UpdateParentDto } from "./dtos/update-parents.dto";
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
import { NotificationService } from "../notification/notification.service";
import { SocketGateway } from "../calendar_event/event.gateway";
import { title } from "process";
import { AuditLogService } from "../audit_log/audit-log.service";
import { OBSFileService } from "src/services/obs-file.service";
import { bufferToStream } from "helper/functions";
import { Role } from "../role/role.entity";
import { RemoveParentFromStudentDto } from "./dtos/remove-parent-from-student.dto";
import { RolesGuard } from "../auth/role-auth-guard";
import { StudentService } from "../student/student.service";
import { In } from "typeorm";
@Controller("parent")
@ApiBearerAuth()
@ApiTags("Parent")
export class ParentController {
    constructor(
        private parentService: ParentService,
        private instituteService: InstituteService,
        private usersService: UsersService,
        private roleService: RoleService,
        private uploadService: UploadService,
        private notificationService: NotificationService,
        private socketGateway: SocketGateway,
        private readonly auditLogService: AuditLogService,
        private obsService: OBSFileService,
        private studentService: StudentService
    ) {}

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Post("/create")
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        description: "Parent profile photo and details",
        schema: {
            type: "object",
            properties: {
                // profile_image: { type: "string", format: "binary" },
                first_name: { type: "string" },
                last_name: { type: "string" },
                email: { type: "string", format: "email" },
                mobile_number: { type: "string", example: "+1234567890" },
                // gender: { type: "string" },
                // date_of_birth: { type: "string", format: "date" },
                school_id: { type: "number" },
                relation: { type: "string" },
                // no_of_student: { type: "number" },
                // student_ids_string: { type: "string", example: "1,2,3" },
            },
        },
    })
    @ApiOperation({ summary: "Create Parent and upload profile photo" })
    @ApiResponse({ status: 200, description: "Parent created successfully with profile photo URL" })
    @ApiResponse({ status: 400, description: "No file uploaded or parent already exists" })
    @ApiResponse({ status: 500, description: "Internal server error" })
    @UseInterceptors(FileInterceptor("profile_image"))
    async createParent(@Body() createParentDto: CreateParentDto, @UploadedFile() profile_image: Express.Multer.File, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            if (req.user.institute_id) {
                createParentDto["school_id"] = req.user.institute_id;
            } else {
                if (!createParentDto.school_id) {
                    return commonResponse.error(languageCode, res, "SCHOOL_REQUIRED", 409, {});
                }
            }
            let parentRole = await this.roleService.getRoleByInfo({ role_name: "parents" });
            if (parentRole?.id) {
                createParentDto["role_id"] = parentRole.id;
            }

            const role_name = parentRole ? parentRole.role_name : "parents";
            let first_name = createParentDto.first_name;
            let last_name = createParentDto.last_name;

            let checkExistUser = await this.usersService.isExist({ email: createParentDto.email });
            if (checkExistUser) {
                return commonResponse.error(languageCode, res, "USER_EXIST", 409, {});
            }

            let instituteInfo = await this.instituteService.getInstituteById(createParentDto.school_id);
            let school_name = instituteInfo?.school_name;
            if (!instituteInfo) {
                return commonResponse.error(languageCode, res, "SCHOOL_NOT_FOUND", 404, {});
            }

            let userPayload = {
                ...createParentDto,
                first_name: createParentDto.first_name,
                last_name: createParentDto.last_name,
                user_name: createParentDto.first_name,
                status: "pending",
                created_by: req.user.userId,
                district_id: instituteInfo.district_id,
                province_id: instituteInfo.province_id,
                school_id: instituteInfo.id,
            };

            let currentUsers = Number(instituteInfo.current_users) + 1;

            if (currentUsers > Number(instituteInfo.max_users)) {
                let socketPayload = {
                    title: "parent",
                    message: "The user limit has been reached. You cannot add more users at this time.",
                    school_id: instituteInfo.id,
                    created_by: instituteInfo.created_by,
                };
                this.socketGateway.commonNotificationForAllModule(instituteInfo.id);
                return commonResponse.error(languageCode, res, "USER_LIMIT_REACHED", 409, {});
            }

            createParentDto["created_by"] = req.user.userId;

            // if (profile_image) {
            //     const fileUrl = await this.uploadService.uploadFile(profile_image);
            //     createParentDto.profile_image = fileUrl;
            //     userPayload["profile_photo_url"] = fileUrl;
            // }

            let checkExistParent = await this.parentService.isExist({ email: createParentDto.email });
            if (checkExistParent) {
                return commonResponse.error(languageCode, res, "PARENT_ALREADY_EXISTS", 400, {});
            }

            let user = await this.usersService.create(userPayload);
            createParentDto["parent_user_id"] = user.id;

            let create = await this.parentService.createParent(createParentDto);
            if (create) {
                let instituteId = instituteInfo.id;
                delete instituteInfo.id;

                let updatePayload = { ...instituteInfo, current_users: currentUsers };
                this.instituteService.updateInstitute(instituteId, updatePayload);

                this.usersService.sendWelComeEmail(createParentDto.email, user.id, role_name, first_name, last_name, school_name);
                this.usersService.verifyEmail(createParentDto.email, user.id);

                // const event = await this.parentService.createParent(createParentDto);

                this.auditLogService.create({
                    action: "CREATE",
                    message: `Parent ${create.first_name} ${create.last_name} created.`,
                    old_data: null,
                    new_data: create,
                    action_user_id: req.user.userId,
                    role_id: create.role_id,
                    school_id: create.school_id,
                });

                return commonResponse.success(languageCode, res, "PARENT_CREATED", 200, {
                    parents: create,
                    profile_photo_url: userPayload["profile_photo_url"],
                });
            } else {
                return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
            }
        } catch (error) {
            console.log("parentError", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.PARENTS)
    @Get("/student-list")
    @ApiQuery({ name: "sort", required: false, type: String, example: "asc", description: "Sort order (asc/desc)" })
    @ApiQuery({ name: "limit", required: false, type: Number, example: 10, description: "Limit the number of results" })
    @ApiQuery({ name: "page", required: false, type: Number, example: 1, description: "Page number for pagination" })
    @ApiQuery({ name: "search", required: false, type: String, example: "Name", description: "Search by name" })
    @ApiQuery({ name: "school_id", required: false, type: Number, example: 1, description: "Filter by school_id" })
    @ApiQuery({ name: "grade_id", required: false, type: Number, example: 1, description: "Filter by grade_id" })
    @ApiQuery({ name: "division_id", required: false, type: Number, example: 1, description: "Filter by division_id" })
    @ApiQuery({ name: "batch_id", required: false, type: Number, example: 1, description: "Filter by batch_id" })
    @ApiQuery({ name: "addmission_no", required: false, type: String, description: "Filter by addmission_no" })
    @ApiQuery({
        name: "sortField",
        required: false,
        type: String,
        enum: ["first_name", "last_name", "created_at", "addmission_no"],
        example: "created_at",
    })
    async getParentsStudent(@Req() req: any, @Res() res: any, @Query() query: any) {
        const languageCode = req.headers["language_code"];
        try {
            if (req?.user?.institute_id) {
                query["school_id"] = req.user.institute_id;
            }
            let response = {
                totalCount: 0,
                currentPage: 0,
                totalPages: 0,
                list: [],
            };

            query.parentId = req.user.userId;

            let checkFirstParentExist = await this.parentService.isExist({ parent_user_id: query.parentId });

            if (!checkFirstParentExist || req.user.role_name != ROLE.PARENTS) {
                return commonResponse.success(languageCode, res, "STUDENT_LIST", 200, response);
            }
            let learnerList = await this.parentService.fetchLearnerList(query);
            if (learnerList?.list?.length) {
                for (let student of learnerList.list) {
                    if (student?.profile_image) {
                        const expiresIn = parseInt(process.env.SIGNATURE_EXPIRY); // Link valid for 1 hour
                        student.profile_image = await this.obsService.getObject(student.profile_image, expiresIn);
                    } else {
                        student.profile_image = DEFAULT_AVTAR.DEFAULT_IMAGE;
                    }
                }
            }
            return commonResponse.success(languageCode, res, "STUDENT_LIST", 200, learnerList);
        } catch (error) {
            console.log("🚀 ~ ParentController ~ getParentsStudent ~ error:", error);
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
    @ApiQuery({
        name: "sortField",
        required: false,
        type: String,
        enum: ["first_name", "last_name", "created_at"],
        example: "created_at",
    })
    async getParents(@Req() req, @Res() res, @Query() query: any) {
        const languageCode = req.headers["language_code"];
        try {
            if (req.user.institute_id) {
                query["school_id"] = req.user.institute_id;
            }
            const response = await this.parentService.getParents(query);
            if (response && response?.list) {
                // response.list = response.list.map((parent: any) => {
                //     if (parent.profile_image) {
                //         parent.profile_image = `${process.env.API_SERVER_PATH}/profile/${parent.profile_image}`;
                //     }
                //     return parent;
                // });

                for (let parents of response.list) {
                    if (parents?.profile_image) {
                        const expiresIn = parseInt(process.env.SIGNATURE_EXPIRY); // Link valid for 1 hour
                        parents.profile_image = await this.obsService.getObject(parents.profile_image, expiresIn);
                    } else {
                        parents.profile_image = DEFAULT_AVTAR.DEFAULT_IMAGE;
                    }
                }
                return commonResponse.success(languageCode, res, "PARENT_LIST", 200, response);
            } else {
                return commonResponse.error(languageCode, res, "PARENT_LIST_ERROR", 400, {});
            }
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    /*
     *   Get Parents details by Id
     */
    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Get(":id")
    @ApiParam({ name: "id", required: true, type: Number, example: 1, description: "Parent ID" })
    async getParentById(@Param("id") id: number, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            let parentDetails = await this.parentService.getParentById(id);
            if (!parentDetails) {
                return commonResponse.error(languageCode, res, "PARENT_NOT_FOUND", 404, {});
            }
            // parentDetails.profile_image = process.env.API_SERVER_PATH + "/profile/" + parentDetails.profile_image;
            const expiresIn = parseInt(process.env.SIGNATURE_EXPIRY); // Link valid for 1 hour
            if (parentDetails?.profile_image) {
                parentDetails.profile_image = await this.obsService.getObject(parentDetails.profile_image, expiresIn);
            } else {
                parentDetails.profile_image = DEFAULT_AVTAR.DEFAULT_IMAGE;
            }

            if (parentDetails.students && parentDetails.students.length) {
                // parentDetails.students.map((students) => {
                //     if (students.profile_image) {
                //         students.profile_image = process.env.API_SERVER_PATH + "/profile/" + students.profile_image;
                //     }
                // });
                for (let students of parentDetails?.students) {
                    if (students?.profile_image) {
                        students.profile_image = await this.obsService.getObject(students.profile_image, expiresIn);
                    } else {
                        students.profile_image = DEFAULT_AVTAR.DEFAULT_IMAGE;
                    }
                }
            }
            return commonResponse.success(languageCode, res, "PARENT_DETAILS", 200, parentDetails);
        } catch (error) {
            console.log("🚀 ~ ParentController ~ getParentById ~ error:", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Patch("patch/:id")
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        description: "Parent profile photo and details",
        schema: {
            type: "object",
            properties: {
                profile_image: { type: "string", format: "binary" },
                first_name: { type: "string" },
                last_name: { type: "string" },
                email: { type: "string", format: "email" },
                mobile_number: { type: "string", example: "+1234567890" },
                school_id: { type: "number" },
                relation: { type: "string" },
            },
        },
    })
    @ApiOperation({ summary: "Create Parent and upload profile photo" })
    @ApiResponse({ status: 200, description: "Parent created successfully with profile photo URL" })
    @ApiResponse({ status: 400, description: "No file uploaded or admin already exists" })
    @ApiResponse({ status: 500, description: "Internal server error" })
    @UseInterceptors(FileInterceptor("profile_image"))
    @ApiParam({ name: "id", required: true, type: Number, example: 1, description: "Parent ID" })
    async updateParent(
        @Param("id") id: number,
        @Body() updateParentDto: UpdateParentDto,
        @UploadedFile() profile_image: Express.Multer.File,
        @Req() req,
        @Res() res
    ) {
        const languageCode = req.headers["language_code"];
        try {
            let checkExist = await this.parentService.isExist({ id: id });
            if (!checkExist) {
                return commonResponse.error(languageCode, res, "PARENT_NOT_FOUND", 400, {});
            }

            let oldAdmin = { ...checkExist };

            if (profile_image) {
                if (checkExist && checkExist.profile_image !== null) {
                    await this.uploadService.deleteFile(checkExist.profile_image);
                }

                const directoryPath = "uploads/profile-pic/parents";

                const objectKey = `${directoryPath}/${Date.now()}-${profile_image.originalname}`;

                const fileStream = bufferToStream(profile_image.buffer);

                await this.obsService.uploadObject(objectKey, fileStream, profile_image.mimetype);

                // const fileUrl = await this.uploadService.uploadFile(profile_image);
                updateParentDto.profile_image = objectKey;
            }

            let updateParent = await this.parentService.updateParent(id, updateParentDto);

            if (updateParent) {
                // let instituteInfo = await this.instituteService.getInstituteById(updateParent.school_id);
                let userUpdatePayload = {
                    ...updateParent,
                    updated_by: req.user.userId,
                    first_name: updateParent.first_name,
                    last_name: updateParent.last_name,
                    // district_id: instituteInfo?.district_id,
                    // province_id: instituteInfo?.province_id,
                    // school_id: instituteInfo?.id,
                };
                delete userUpdatePayload.id;
                // // delete userUpdatePayload.parent_user_id;
                // await this.usersService.updateUser(updateParent.parent_user_id, userUpdatePayload);

                await this.auditLogService.create({
                    action: "UPDATE",
                    message: `Parent ${updateParent.first_name} ${updateParent.last_name} updated.`,
                    old_data: oldAdmin,
                    new_data: updateParent,
                    action_user_id: req.user.userId,
                    role_id: updateParent.role_id,
                    school_id: updateParent.school_id,
                });

                return commonResponse.success(languageCode, res, "PARENT_UPDATED_SUCCESS", 200, updateParent);
            } else {
                return commonResponse.error(languageCode, res, "PARENT_UPDATE_ERROR", 400, {});
            }
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Delete("delete/:id")
    @ApiParam({ name: "id", required: true, type: Number, example: 1, description: "Parent ID" })
    // async deleteParent(@Param("id") id: number, @Req() req, @Res() res) {
    //     const languageCode = req.headers["language_code"];
    //     try {
    //         let checkExist = await this.parentService.isExist({ id: id });

    //         if (!checkExist) {
    //             return commonResponse.error(languageCode, res, "PARENT_NOT_FOUND", 404, {});
    //         }

    //         const oldData = { ...checkExist };

    //         let response = await this.parentService.deleteParent(id);
    //         if (response && response.parent_user_id) {
    //             await this.usersService.deleteUser(Number(response.parent_user_id));
    //         }

    //         const deletedAt = new Date();

    //         const auditLogData = {
    //             action: "DELETE",
    //             message: `Parent ${checkExist.first_name} ${checkExist.last_name} deleted.`,
    //             old_data: oldData,
    //             new_data: null,
    //             action_user_id: req.user.userId,
    //             role_id: checkExist.role_id,

    //             school_id: checkExist.school_id,
    //             deleted_at: deletedAt,
    //         };
    //         await this.auditLogService.create(auditLogData);

    //         return commonResponse.success(languageCode, res, "PARENT_DELETED_SUCCESS", 200, {});
    //     } catch (error) {
    //         return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
    //     }
    // }
    async deleteParent(@Param("id") id: number, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            let parent = await this.parentService.parentWithStudent({ id: id });

            if (!parent) {
                return commonResponse.error(languageCode, res, "PARENT_NOT_FOUND", 404, {});
            }

            // let flag = false;
            // if (parent?.students?.length) {
            //     let studentIds = parent?.students.map((data) => data.id);
            //     let fetchStudentWithParent = await this.studentService.getStudentParentRelation({ id: In(studentIds) });
            //     if (fetchStudentWithParent?.length) {
            //         for (let data of fetchStudentWithParent) {
            //             if (data?.parents?.length) {
            //                 let existanotherParent = data.parents.find((e) => String(e?.id) != String(parent?.id));
            //             .0}
            //         }
            //     }
            // }
            await this.parentService.updateParent(id, { deleted_at: new Date() } as any);
            await this.usersService.deleteUser(Number(parent.parent_user_id));

            const auditLogData = {
                action: "DELETE",
                message: `Parent ${parent.first_name} ${parent.last_name} marked as deleted.`,
                old_data: parent,
                new_data: null,
                action_user_id: req.user.userId,
                role_id: parent.role_id,
                school_id: parent.school_id,
            };
            await this.auditLogService.create(auditLogData);

            return commonResponse.success(languageCode, res, "PARENT_DELETED_SUCCESS", 200, {});
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.STUDENT)
    @Patch("remove-parent-from-student")
    async removeParent(@Body() body: RemoveParentFromStudentDto, @Req() req: any, @Res() res: any) {
        const languageCode = req.headers["language_code"];
        console.log("🚀 ~ ParentController ~ removeParent ~ languageCode:", languageCode);
        try {
            let parent = await this.parentService.isExist({ id: body.parentId });
            if (!parent) {
                return commonResponse.error(languageCode, res, "PARENT_NOT_FOUND", 404, {});
            }
            let associatedRelation = await this.parentService.getParentStudentRelation(body.studentId, body.parentId);
            console.log("🚀 ~ ParentController ~ removeParent ~ associatedRelation:", associatedRelation);
            if (!associatedRelation) {
                return commonResponse.success(languageCode, res, "PARENT_REMOVED_SUCCESSFULLY", 200, {});
            }
            // remove
            let removeParentStudentRelation = await this.parentService.removeParentStudentRelation(associatedRelation.id);
            console.log("🚀 ~ ParentController ~ removeParent ~ removeParentStudentRelation:", removeParentStudentRelation);
            if (!removeParentStudentRelation) {
                return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
            }
            return commonResponse.success(languageCode, res, "PARENT_REMOVED_SUCCESSFULLY", 200, {});
        } catch (error) {
            console.log("🚀 ~ ParentController ~ removeParent ~ error:", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }
}
