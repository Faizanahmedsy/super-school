import { Controller, Get, Post, Body, Param, Patch, Req, Res, Delete, Query, UseGuards, UseInterceptors, UploadedFile } from "@nestjs/common";
import { StudentService } from "./student.service";
import { commonResponse } from "helper";
import { CreateStudentDto } from "./dtos/create-student.dto";
import { UpdateStudentDto } from "./dtos/update-student.dto";
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags, ApiConsumes, ApiBody, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Roles } from "src/decorator/role_decorator";
import { LANGUAGE_CODE, ROLE, DEFAULT_AVTAR } from "helper/constants";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UsersService } from "../users/user.service";
import { RoleService } from "../role/role.service";
import { InstituteService } from "../institutes/institutes.service";
import { ParentService } from "../parents/parents.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadService } from "../upload/upload.service";
import { Express } from "express";
import { DivisionSubjectService } from "../division_subject/divisionsubject.service";
import { SocketGateway } from "../calendar_event/event.gateway";
import { NotificationService } from "../notification/notification.service";
import { AuditLogService } from "../audit_log/audit-log.service";
import { MultiCreateParentsDto } from "./dtos/multicretae-parent.dto";
import { ModuleService } from "../module/module.service";
import { User } from "../users/user.entity";
import { AdminService } from "../admin/admin.service";
import { OBSFileService } from "src/services/obs-file.service";
import { bufferToStream } from "helper/functions";

@Controller("student")
@ApiBearerAuth()
@ApiTags("Student")
export class StudentController {
    constructor(
        private studentService: StudentService,
        private instituteService: InstituteService,
        private usersService: UsersService,
        private roleService: RoleService,
        private parentsService: ParentService,
        private uploadService: UploadService,
        private divisionSubjectService: DivisionSubjectService,
        private socketGateway: SocketGateway,
        private notificationService: NotificationService,
        private readonly auditLogService: AuditLogService,
        private moduleServices: ModuleService,
        private adminServices: AdminService,
        private obsService: OBSFileService
    ) {}

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Post("/create")
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        description: "Student profile photo and details",
        schema: {
            type: "object",
            properties: {
                profile_image: { type: "string", format: "binary" },
                addmission_no: { type: "string" },
                first_name: { type: "string" },
                last_name: { type: "string" },
                email: { type: "string", format: "email" },
                mobile_number: { type: "string", example: "+1234567890" },
                gender: { type: "string" },
                date_of_birth: { type: "string", format: "date" },
                school_id: { type: "number" },
                cur_batch_id: { type: "number" },
                grade_id: { type: "number" },
                grade_class_id: { type: "number" },
                extra_activity: { type: "string" },
                subject_ids_string: { type: "string", example: "1,2,3" },
                parents: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            first_name: { type: "string" },
                            last_name: { type: "string" },
                            email: { type: "string", format: "email" },
                            mobile_number: { type: "string" },
                            relationship: { type: "string" },
                        },
                    },
                },
            },
        },
    })
    @ApiOperation({ summary: "Upload profile image" })
    @ApiResponse({ status: 200, description: "Profile image uploaded successfully" })
    @ApiResponse({ status: 400, description: "No file uploaded or user ID not found" })
    @ApiResponse({ status: 500, description: "Internal server error" })
    @UseInterceptors(FileInterceptor("profile_image"))
    async createStudent(
        @Body() createStudentDto: CreateStudentDto & MultiCreateParentsDto,
        @UploadedFile() profile_image: Express.Multer.File,
        @Req() req,
        @Res() res
    ) {
        const languageCode = req.headers["language_code"] || "en";
        try {
            console.log("req.user====", req.user);
            if (req.user.institute_id) {
                createStudentDto["school_id"] = req.user.institute_id;
            } else {
                if (!createStudentDto.school_id) {
                    return commonResponse.error(languageCode, res, "SCHOOL_REQUIRED", 409, {});
                }
            }
            let subject_ids = createStudentDto.subject_ids_string.split(",").map(Number);
            delete createStudentDto.subject_ids_string;
            let parents = createStudentDto.parents;
            console.log("🚀 ~ StudentController ~ parents:", parents);
            delete createStudentDto.parents;
            createStudentDto["created_by"] = req.user.userId;

            const studentRole = await this.roleService.getRoleByInfo({ role_name: "student" });

            if (studentRole && studentRole.id) {
                createStudentDto["role_id"] = studentRole.id;
            }

            const role_name = studentRole ? studentRole.role_name : "student";
            let first_name = createStudentDto.first_name;
            let last_name = createStudentDto.last_name;

            const checkExistUser = await this.usersService.isExist({ email: createStudentDto.email });
            if (checkExistUser) {
                return commonResponse.error(languageCode, res, "STUDENT_ALREADY_EXISTS", 409, {});
            }
            const instituteInfo = await this.instituteService.getInstituteById(createStudentDto.school_id);
            let school_name = instituteInfo?.school_name;
            if (!instituteInfo) {
                return commonResponse.error(languageCode, res, "INSTITUTE_NOT_FOUND", 404, {});
            }
            const userPayload = {
                ...createStudentDto,
                user_name: createStudentDto.first_name,
                status: "pending",
                school_id: instituteInfo?.id,
            };
            if (profile_image) {
                // const fileUrl = await this.uploadService.uploadFile(profile_image);
                // createStudentDto.profile_image = fileUrl;

                const directoryPath = "uploads/profile-pic/admin";

                const objectKey = `${directoryPath}/${Date.now()}-${profile_image.originalname}`;

                const fileStream = bufferToStream(profile_image.buffer);

                await this.obsService.uploadObject(objectKey, fileStream, profile_image.mimetype);
                createStudentDto.profile_image = objectKey;
                userPayload["profile_photo_url"] = objectKey;
            }

            const checkExistAdmissionNumber = await this.studentService.isExist({
                addmission_no: createStudentDto.addmission_no,
                school_id: createStudentDto.school_id, // verifying student admission number to be unique in his school
            });
            if (checkExistAdmissionNumber) {
                return commonResponse.error(languageCode, res, "UNIQUE_ADMISSION_NO", 400, {});
            }
            const checkExistStudent = await this.studentService.isExist({ email: createStudentDto.email });
            if (checkExistStudent) {
                return commonResponse.error(languageCode, res, "STUDENT_ALREADY_EXISTS", 400, {});
            }
            createStudentDto["user_id"] = req.user.userId;
            // const user = await this.usersService.create(userPayload);
            // createStudentDto["student_user_id"] = user.id;

            // let currentUsers = Number(instituteInfo.current_users) + 1;

            // if (currentUsers > Number(instituteInfo.max_users)) {
            //     let socketPayload = {
            //         title: "student",
            //         message: "The user limit has been reached. You cannot add more users at this time.",
            //         school_id: instituteInfo.id,
            //         created_by: instituteInfo.created_by,
            //     };
            //     this.socketGateway.emitToAdminsAndSuperAdmins(socketPayload);
            //     return commonResponse.error(languageCode, res, "USER_LIMIT_REACHED", 409, {});
            // }
            let current_users = Number(instituteInfo.current_users); // Add 1 to current users
            let totalUsers = current_users; // Set totalUsers to current_users + 1
            console.log(`🚀 🚀 <<<<<< ::::: - 🚀 🚀- ::::: >>>>>> ~ totalUsers: `, totalUsers);

            let maxUsers = Number(instituteInfo.max_users); // Max users in the institute
            console.log(`🚀 🚀 <<<<<< ::::: - 🚀 🚀- ::::: >>>>>> ~ maxUsers: `, maxUsers);

            let userShouldbe = current_users + 1; // 1 for student
            let updateUserCount = userShouldbe;

            let newParentsData = Array.isArray(parents) ? parents : JSON.parse(parents);

            let totalUserNow: number;

            let module = await this.moduleServices.findModuleByNameShow("learners");
            let superAdminRole = await this.roleService.getRoleByInfo({ role_name: "super_admin" });
            let schoolAdmin = await this.adminServices.getAdminByObj({ school_id: instituteInfo.id });
            let superAdmin: User;
            if (superAdminRole) {
                superAdmin = await this.usersService.findUserByRole(superAdminRole.id);
            }
            if (newParentsData?.length) {
                const emailArray: string[] = newParentsData
                    .filter((item: any) => typeof item?.email === "string" && item.email.trim() !== "") // Ensure email exists, is a string, and is not empty
                    .map((item: any) => item.email.trim()); // Trim and extract the email
                console.log("🚀 ~ StudentController ~ emailArray:=========", emailArray);

                // Fetch existing parents by email
                const existingParent = await this.parentsService.getAllParentByEmail(emailArray);
                console.log("🚀 ~ StudentController ~ existingParent:=====", existingParent);

                // Calculate the number of new users to be created
                const newUserCount = emailArray.length - existingParent.length;

                // Add the number of new users to the current user count (including 1 for the student already created)
                const totalUsers = newUserCount + userShouldbe;
                totalUserNow = totalUsers;
                if (totalUsers > maxUsers) {
                    let socketPayload = {
                        title: "student",
                        message: "The user limit has been reached. You cannot add more users at this time.",
                        school_id: instituteInfo.id,
                        created_by: instituteInfo.created_by,
                        module_id: module.id,
                    };
                    this.socketGateway.commonNotificationForAllModule(instituteInfo.id);
                    // To Admin
                    socketPayload["to_user_id"] = schoolAdmin.school_admin_user_id;
                    let toNotificationToAdmin = await this.notificationService.createNotification(socketPayload);
                    console.log("🚀 ~ NOTIFICATION TO ADMIN", toNotificationToAdmin);
                    // To Super Admin
                    socketPayload["to_user_id"] = superAdmin.id;
                    let toNotificationToSuperAdmin = await this.notificationService.createNotification(socketPayload);
                    console.log("🚀 ~ NOTIFICATION TO SUPER ADMIN", toNotificationToSuperAdmin);

                    if (req.user.role_name == ROLE.MASTER_ADMIN) {
                        return commonResponse.error(languageCode, res, "PARENTS_LIMIT_FOR_ADMIN", 409, {});
                    }
                    return commonResponse.error(languageCode, res, "PARENTS_LIMIT", 409, {});
                }
                updateUserCount = updateUserCount + newUserCount;
                // Continue with your logic if the limit is not exceeded
            }

            let percentage = (totalUserNow / maxUsers) * 100; // Calculate percentage
            console.log("🚀 ~ StudentController ~ maxUsers:", maxUsers);
            console.log("🚀 ~ StudentController ~ totalUserNow:", totalUserNow);
            console.log("🚀 ~ StudentController ~ percentage:", percentage);

            if (percentage >= 90 && percentage < 100) {
                console.log(`Percentage is between 90% and 100%: ${percentage}`);
                let message = `Warning: The number of users in the school "${instituteInfo.school_name}" has reached 90% of the maximum capacity.`;
                await this.notificationService.sendEmailToAdminsAndSuperAdmins(createStudentDto.school_id, message, "90%", totalUsers, maxUsers);

                let socketPayload = {
                    title: "student",
                    message: message,
                    school_id: instituteInfo.id,
                    created_by: instituteInfo.created_by,
                    module_id: module.id,
                };
                this.socketGateway.commonNotificationForAllModule(instituteInfo.id);
                // To Admin
                socketPayload["to_user_id"] = schoolAdmin.school_admin_user_id;
                let toNotificationToAdmin = await this.notificationService.createNotification(socketPayload);
                console.log("🚀 ~ NOTIFICATION TO ADMIN", toNotificationToAdmin);
                // To Super Admin
                socketPayload["to_user_id"] = superAdmin.id;
                let toNotificationToSuperAdmin = await this.notificationService.createNotification(socketPayload);
                console.log("🚀 ~ NOTIFICATION TO SUPER ADMIN", toNotificationToSuperAdmin);
            }

            // Handle 100% notification
            if (percentage >= 100) {
                console.log(`Percentage is 100% or more: ${percentage}`);
                let message = `Alert: The number of users in the school "${instituteInfo.school_name}" has reached 100% of the maximum capacity.`;
                await this.notificationService.sendEmailToAdminsAndSuperAdmins(createStudentDto.school_id, message, "100%", totalUsers, maxUsers);

                let socketPayload = {
                    title: "student",
                    message: message,
                    school_id: instituteInfo.id,
                    created_by: instituteInfo.created_by,
                    module_id: module.id,
                };
                this.socketGateway.commonNotificationForAllModule(instituteInfo.id);
                // To Admin
                socketPayload["to_user_id"] = schoolAdmin.school_admin_user_id;
                let toNotificationToAdmin = await this.notificationService.createNotification(socketPayload);
                console.log("🚀 ~ NOTIFICATION TO ADMIN", toNotificationToAdmin);
                // To Super Admin
                socketPayload["to_user_id"] = superAdmin.id;
                let toNotificationToSuperAdmin = await this.notificationService.createNotification(socketPayload);
                console.log("🚀 ~ NOTIFICATION TO SUPER ADMIN", toNotificationToSuperAdmin);
                // if (current_users > maxUsers) {
                //     socketPayload = {
                //         title: "student",
                //         message: "The user limit has been reached. You cannot add more users at this time.",
                //         school_id: instituteInfo.id,
                //         created_by: instituteInfo.created_by,
                //     };
                //     this.socketGateway.emitToAdminsAndSuperAdmins(socketPayload);

                //     // Return error response
                //     return commonResponse.error("en", res, "USER_LIMIT_END", 409, {});
                // }
            }

            // Managing entry in user table after verifyinh max_user and current_users are valid
            const user = await this.usersService.create(userPayload);
            console.log(createStudentDto, "=============");
            console.log("🚀 ~ StudentController ~ user:=================", user);
            createStudentDto["student_user_id"] = user.id;

            const create = await this.studentService.createStudent(createStudentDto);
            console.log("🚀 ~ StudentController ~ create:===============", create);

            if (create) {
                let instituteId = instituteInfo.id;
                delete instituteInfo.id;

                // let updatePayload = { ...instituteInfo, current_users: updateUserCount };
                // await this.instituteService.updateInstitute(instituteId, updatePayload);

                for (const subject_id of subject_ids) {
                    const divisionSubject = await this.divisionSubjectService.findClassSubject({
                        subject_id: Number(subject_id),
                        grade_class_id: createStudentDto.grade_class_id,
                        grade_id: createStudentDto.grade_id,
                        school_id: createStudentDto.school_id,
                        batch_id: createStudentDto.cur_batch_id,
                    });
                    if (divisionSubject?.length) {
                        const divisionSubjectIds = divisionSubject.map((data) => data.id);
                        // background process
                        this.studentService.addStudentToDivisionSubject(create.id, divisionSubjectIds);
                        //=====
                    }
                }

                this.usersService.sendWelComeEmail(createStudentDto.email, user.id, role_name, first_name, last_name, school_name);

                this.usersService.verifyEmail(createStudentDto.email, user.id);

                const createdParents: any = [];

                let newUserAdded: number = current_users;
                if (parents?.length) {
                    let parentsData;
                    try {
                        parentsData = Array.isArray(parents) ? parents : JSON.parse(parents);
                    } catch (error) {
                        return commonResponse.error(languageCode, res, "INVALID_PARENTS_DATA", 400, {});
                    }
                    const parentsRole = await this.roleService.getRoleByInfo({ role_name: "parents" });
                    for (const parentDto of parentsData) {
                        try {
                            const parentDtoWithStudent = {
                                ...parentDto,
                                role_id: parentsRole.id,
                                school_id: createStudentDto.school_id,
                                created_by: req.user.userId,
                            };

                            // Check if the parent exists with the same email
                            const existingParent = await this.parentsService.getParentByQuery({ email: parentDto.email });
                            let schoolIds: string[];
                            console.log("🚀 ~ StudentController ~ existingParent:", existingParent);
                            if (existingParent?.length) {
                                schoolIds = existingParent.map((data) => String(data.school_id));
                            }
                            console.log("🚀 ~ StudentController ~ schoolIds:", schoolIds);

                            if (existingParent?.length && schoolIds.includes(String(create?.school_id))) {
                                let actualParent = existingParent.find((data) => String(data.school_id) == String(create?.school_id));
                                console.log("🚀 ~ StudentController ~ actualParent:", actualParent);
                                if (actualParent) {
                                    if (actualParent?.deleted_at) {
                                        await this.parentsService.updateParent(actualParent.id, {
                                            ...parentDtoWithStudent,
                                            deleted_at: null,
                                            updated_by: req.user.userId,
                                        });
                                        createdParents.push(actualParent.id);
                                    } else {
                                        await this.parentsService.updateParent(actualParent.id, {
                                            ...parentDtoWithStudent,
                                            updated_by: req.user.userId,
                                        });
                                        createdParents.push(actualParent.id);
                                    }
                                }
                            } else {
                                // Create a new parent if no existing entry
                                let userPayload1 = {
                                    ...parentDto,
                                    first_name: parentDto.first_name,
                                    last_name: parentDto.last_name,
                                    user_name: parentDto.first_name,
                                    status: "pending",
                                    created_by: req.user.userId,
                                    role_id: parentsRole.id,
                                    district_id: instituteInfo.district_id,
                                    province_id: instituteInfo.province_id,
                                    school_id: instituteInfo.id,
                                };
                                let user = await this.usersService.create(userPayload1);
                                parentDtoWithStudent["parent_user_id"] = user.id;
                                const parent = await this.parentsService.createParent(parentDtoWithStudent);

                                const role_name = parentsRole ? parentsRole.role_name : "parents";
                                if (parentDtoWithStudent) {
                                    createdParents.push(parent.id);
                                    this.usersService.sendWelComeEmail(
                                        parentDto.email,
                                        user.id,
                                        role_name,
                                        parentDto.first_name,
                                        parentDto.last_name,
                                        instituteInfo.school_name
                                    );
                                    this.usersService.verifyEmail(parentDto.email, user.id);
                                }
                            }
                            console.log("Existing Parent:", existingParent);
                        } catch (error) {
                            console.error("Error processing parent data:", error);
                        }
                    }
                }

                let parentUpdated = await this.studentService.updateParents(create.id, createdParents);

                if (parentUpdated) {
                    let updatePayload = { ...instituteInfo, current_users: updateUserCount };
                    await this.instituteService.updateInstitute(instituteId, updatePayload);
                }
                this.auditLogService.create({
                    action: "CREATE",
                    message: `Student ${create.first_name} ${create.last_name} created.`,
                    old_data: null,
                    new_data: create,
                    action_user_id: req.user.userId,
                    school_id: create.school_id,
                    role_id: create.role_id,
                });
                return commonResponse.success(languageCode, res, "STUDENT_CREATED", 200, {
                    student: create,
                    profile_photo_url: userPayload["profile_photo_url"],
                    parents: createdParents,
                });
            } else {
                return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
            }
        } catch (error) {
            console.log("createStudentError", error);
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
    async getStudents(@Req() req, @Res() res, @Query() query: any) {
        const languageCode = req.headers["language_code"];
        try {
            if (req.user.institute_id) {
                query["school_id"] = req.user.institute_id;
            }
            const result = await this.studentService.getStudents(query);
            if (result && result?.list) {
                for (let student of result.list) {
                    if (student?.profile_image) {
                        const expiresIn = parseInt(process.env.SIGNATURE_EXPIRY); // Link valid for 1 hour
                        student.profile_image = await this.obsService.getObject(student.profile_image, expiresIn);
                    } else {
                        student.profile_image = DEFAULT_AVTAR.DEFAULT_IMAGE;
                    }
                }

                return commonResponse.success(languageCode, res, "STUDENT_LIST", 200, result);
            } else {
                return commonResponse.error(languageCode, res, "STUDENT_LIST_ERROR", 400, {});
            }
        } catch (error) {
            console.log("getStudentsgetStudentserror", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Get("subject-by/list")
    @ApiQuery({ name: "school_id", required: false, type: Number, example: 1, description: "Filter by school_id" })
    @ApiQuery({ name: "grade_id", required: false, type: Number, example: 1, description: "Filter by grade_id" })
    @ApiQuery({ name: "division_id", required: false, type: Number, example: 1, description: "Filter by division_id" })
    @ApiQuery({ name: "batch_id", required: false, type: Number, example: 1, description: "Filter by batch_id" })
    @ApiQuery({ name: "term_id", required: false, type: Number, example: 1, description: "Filter by term_id" })
    async getAllStudentBySubjectId(@Req() req, @Res() res, @Query() query: any) {
        const languageCode = req.headers["language_code"];
        try {
            const result = await this.studentService.getAllStudentBySubjectId(query);

            // if (result && result.list && result.list.length > 0) {
            //     // Update the profile_image for each student in the list
            //     result.list = result.list.map((student) => {
            //         if (student.profile_image) {
            //             student.profile_image = `${process.env.API_SERVER_PATH}${student.profile_image}`;
            //         }

            //         return student;
            //     });

            //     return commonResponse.success(languageCode, res, "STUDENT_LIST", 200, result);
            // } else {
            //     return commonResponse.error(languageCode, res, "STUDENT_LIST_ERROR", 400, {});
            // }
            return commonResponse.success(languageCode, res, "STUDENT_LIST", 200, result);
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Get(":id")
    @ApiParam({ name: "id", required: true, type: Number, example: 1, description: "Student ID" })
    async getStudentById(@Param("id") id: number, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            let studentDetails = await this.studentService.getStudentForDetail(id);
            if (studentDetails) {
                let findStudent = await this.studentService.getStudentSubjectById(id, studentDetails.grade_class_id);
                studentDetails["divisionSubjects"] = findStudent?.divisionSubjects;

                // studentDetails.profile_image = process.env.API_SERVER_PATH + "/profile/" + studentDetails.profile_image;
                const expiresIn = parseInt(process.env.SIGNATURE_EXPIRY); // Link valid for 1 hour
                if (studentDetails?.profile_image) {
                    studentDetails.profile_image = await this.obsService.getObject(studentDetails.profile_image, expiresIn);
                } else {
                    studentDetails.profile_image = DEFAULT_AVTAR.DEFAULT_IMAGE;
                }
                return commonResponse.success(languageCode, res, "STUDENT_DETAILS", 200, studentDetails);
            } else {
                return commonResponse.error(languageCode, res, "STUDENT_NOT_FOUND", 400, {});
            }
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Patch("patch/:id")
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        description: "Student profile photo and details",
        schema: {
            type: "object",
            properties: {
                profile_image: { type: "string", format: "binary" },
                addmission_no: { type: "string" },
                first_name: { type: "string" },
                last_name: { type: "string" },
                email: { type: "string", format: "email" },
                mobile_number: { type: "string", example: "+1234567890" },
                gender: { type: "string" },
                date_of_birth: { type: "string", format: "date" },
                school_id: { type: "number" },
                grade_id: { type: "number" },
                grade_class_id: { type: "number" },
                subject_ids_string: { type: "string", example: "[1,2,3]" },
                parents: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            first_name: { type: "string" },
                            last_name: { type: "string" },
                            email: { type: "string", format: "email" },
                            mobile_number: { type: "string" },
                            relationship: { type: "string" },
                        },
                    },
                },
            },
        },
    })
    @UseInterceptors(FileInterceptor("profile_image"))
    async updateStudent(
        @Param("id") id: number,
        @Body() updateStudentDto: UpdateStudentDto & MultiCreateParentsDto,
        @UploadedFile() profile_image: Express.Multer.File,
        @Req() req,
        @Res() res
    ) {
        const languageCode = req.headers["language_code"];
        try {
            let checkExist = await this.studentService.isExist({ id: id });
            if (!checkExist) {
                return commonResponse.error(languageCode, res, "STUDENT_NOT_FOUND", 400, {});
            }
            if (updateStudentDto.email && updateStudentDto.email !== checkExist.email) {
                const checkExistEmail = await this.usersService.isExist({ email: updateStudentDto.email });
                if (checkExistEmail) {
                    return commonResponse.error(languageCode, res, "EMAIL_ALREADY_EXISTS", 400, {});
                }
            }
            let oldAdmin = { ...checkExist };
            if (profile_image) {
                if (checkExist.profile_image !== null) {
                    await this.obsService.deleteObject(checkExist.profile_image);
                }

                const directoryPath = "uploads/profile-pic/admin";

                const objectKey = `${directoryPath}/${Date.now()}-${profile_image.originalname}`;

                const fileStream = bufferToStream(profile_image.buffer);
                await this.obsService.uploadObject(objectKey, fileStream, profile_image.mimetype);
                // const fileUrl = await this.uploadService.uploadFile(profile_image);
                updateStudentDto.profile_image = objectKey;
            }

            if (updateStudentDto?.addmission_no) {
                const checkExistAdmissionNumber = await this.studentService.isExist({
                    addmission_no: updateStudentDto.addmission_no,
                    school_id: updateStudentDto.school_id, // verifying student admission number to be unique in his school
                });
                if (checkExistAdmissionNumber && checkExistAdmissionNumber.addmission_no != checkExist.addmission_no) {
                    return commonResponse.error(languageCode, res, "UNIQUE_ADMISSION_NO", 400, {});
                }
            }
            let updatedStudent = await this.studentService.updateStudent1(id, updateStudentDto);
            if (updatedStudent) {
                let subject_ids = updateStudentDto.subject_ids_string.split(",").map(Number);
                let divisionSubjects = [];

                for (const subject_id of subject_ids) {
                    const divisionSubject = await this.divisionSubjectService.findClassSubject({
                        subject_id: Number(subject_id),
                        grade_class_id: Number(updatedStudent.grade_class_id),
                        grade_id: Number(updatedStudent.grade_id),
                        school_id: Number(updatedStudent.school_id),
                        batch_id: Number(updatedStudent.cur_batch_id),
                    });

                    if (divisionSubject) {
                        divisionSubjects.push(...divisionSubject.map((data) => data.id));
                    }
                }

                console.log("divisionSubjects==============", divisionSubjects);
                // Background process
                let updated = await this.studentService.updateStudentDivisionSubjects(updatedStudent.id, divisionSubjects);
                console.log("🚀 ~ StudentController ~ updated:================================", updated);
                //=====
                let instituteInfo = await this.instituteService.getInstituteById(updatedStudent.school_id);
                let userUpdatePayload = {
                    ...updatedStudent,
                    first_name: updatedStudent.first_name,
                    last_name: updatedStudent.last_name,
                    school_id: instituteInfo?.id,
                };
                delete userUpdatePayload.id;
                delete userUpdatePayload.student_user_id;

                let parentsData = [];
                if (updateStudentDto.parents) {
                    try {
                        parentsData = Array.isArray(updateStudentDto.parents) ? updateStudentDto.parents : JSON.parse(updateStudentDto.parents);
                    } catch (error) {
                        return commonResponse.error(languageCode, res, "INVALID_PARENTS_DATA", 400, {});
                    }
                }
                console.log("🚀 ~ StudentController ~ parentsData:", parentsData);
                let updatedParents: any = [];
                const parentsRole = await this.roleService.getRoleByInfo({ role_name: "parents" });
                for (const parentDto of parentsData) {
                    const parentDtoWithStudent = {
                        ...parentDto,
                        role_id: parentsRole.id,
                        school_id: updatedStudent.school_id,
                        created_by: req.user.userId,
                    };
                    const existingParent = await this.parentsService.getParentByEmail(parentDto.email);
                    if (existingParent) {
                        await this.parentsService.updateParent(existingParent.id, {
                            ...parentDtoWithStudent,
                            updated_by: req.user.userId,
                        });
                        updatedParents.push(existingParent.id);
                    } else {
                        const parentUser = await this.usersService.create({
                            ...parentDto,
                            first_name: parentDto.first_name,
                            last_name: parentDto.last_name,
                            user_name: parentDto.first_name,
                            status: "pending",
                            created_by: req.user.userId,
                            role_id: parentsRole.id,
                            school_id: updatedStudent.school_id,
                        });
                        parentDtoWithStudent["parent_user_id"] = parentUser.id;
                        const parent = await this.parentsService.createParent(parentDtoWithStudent);
                        updatedParents.push(parent.id);
                        this.usersService.sendWelComeEmail(
                            parentDto.email,
                            parent.id,
                            parentsRole.role_name,
                            parentDto.first_name,
                            parentDto.last_name,
                            instituteInfo.school_name
                        );
                        this.usersService.verifyEmail(parentDto.email, parentUser.id);
                    }
                }
                this.studentService.updateParents(updatedStudent.id, updatedParents);
                delete updatedStudent.parents;
                await this.auditLogService.create({
                    action: "UPDATE",
                    message: `Student ${updatedStudent.first_name} ${updatedStudent.last_name} updated.`,
                    old_data: oldAdmin,
                    new_data: updatedStudent,
                    action_user_id: req.user.userId,
                    role_id: updatedStudent.role_id,

                    school_id: updatedStudent.school_id,
                });

                return commonResponse.success(languageCode, res, "STUDENT_UPDATED_SUCCESS", 200, {
                    student: updatedStudent,
                    profile_photo_url: updateStudentDto.profile_image,
                    parents: updatedParents,
                });
            } else {
                return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
            }
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Delete("delete/:id")
    @ApiParam({ name: "id", required: true, type: Number, example: 1, description: "Student ID" })
    async deleteStudent(@Param("id") id: number, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            let checkExist = await this.studentService.isExist({ id: id });
            if (!checkExist) {
                return commonResponse.error(languageCode, res, "STUDENT_NOT_FOUND", 404, {});
            }
            const oldData = { ...checkExist };

            let response = await this.studentService.deleteStudent(id);
            if (response && response.student_user_id) {
                await this.usersService.deleteUser(Number(response.student_user_id));
            }
            const deletedAt = new Date();
            const auditLogData = {
                action: "DELETE",
                message: `Student ${checkExist.first_name} ${checkExist.last_name} deleted.`,
                old_data: oldData,
                new_data: null,
                action_user_id: req.user.userId,
                role_id: checkExist.role_id,

                school_id: checkExist.school_id,
                deleted_at: deletedAt,
            };
            await this.auditLogService.create(auditLogData);
            return commonResponse.success(languageCode, res, "STUDENT_DELETED_SUCCESS", 200, {});
        } catch (error) {
            console.error("Error deleting student:", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }
}
