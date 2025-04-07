import { Controller, Post, Body, Req, Res, UnauthorizedException, UsePipes, ValidationPipe, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { commonResponse } from "helper";
import { UsersService } from "../users/user.service";
import { LoginDto } from "./dtos/login.dto";
import { ForgotPasswordDto } from "../auth/dtos/forgot-password.dto";
import { ResetPasswordDto } from "./dtos/reset-password.dto";

import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { TeacherService } from "../teacher/teacher.service";
import { ParentService } from "../parents/parents.service";
import { StudentService } from "../student/student.service";
import { AdminService } from "../admin/admin.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { Roles } from "src/decorator/role_decorator";
import { ROLE } from "helper/constants";
import { ChangePasswordDto } from "./dtos/change-password.dto";
import { ReLoginDto } from "./dtos/re-login.dto";
import { VerifyUserDto } from "./dtos/verify-user.dto";

@ApiBearerAuth()
@Controller("auth")
@ApiTags("Auth")
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
        private readonly teacherService: TeacherService,
        private readonly parentService: ParentService,
        private readonly studentService: StudentService,
        private readonly adminService: AdminService
    ) {}

    @Post("login")
    @UsePipes(new ValidationPipe({ transform: true }))
    async login(@Body() loginDto: LoginDto, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            if (typeof loginDto.email !== "string" || typeof loginDto.password !== "string") {
                throw new Error("Both arguments must be strings");
            }
            const user = await this.authService.validateUser(loginDto.email, loginDto.password);

            if (user === "user_not_found") {
                return commonResponse.error(languageCode, res, "INVALID_EMAIL", 400, {});
            }
            if (user === "password_not_set") {
                return commonResponse.error(languageCode, res, "PASSWORD_NOT_SET", 400, {});
            }
            if (user === "password_not_match") {
                return commonResponse.error(languageCode, res, "INVALID_PASSWORD", 400, {});
            }

            if (user.status == "pending") {
                return commonResponse.error(languageCode, res, "EMAIL_NOT_VERIFIED", 400, {});
            }
            const loginResponse = await this.authService.login(user);
            if (loginResponse == "USER_NOT_LONGER_EXIST") {
                return commonResponse.error(languageCode, res, "USER_NOT_LONGER_EXIST", 400, {});
            }
            return commonResponse.success(languageCode, res, "LOGIN_SUCCESS", 200, loginResponse);
        } catch (error) {
            console.error("Error during login:", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }
    @Post("forgot-password")
    @UsePipes(new ValidationPipe({ transform: true }))
    async forgotPassword(@Body() body: ForgotPasswordDto, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            const response = await this.authService.forgotPassword(body.email);

            if (response.error === "user_not_found") {
                return commonResponse.error(languageCode, res, "INVALID_EMAIL", 400, {});
            }

            return commonResponse.success(languageCode, res, "FORGOT_PASSWORD_SUCCESS", 200, response);
        } catch (error) {
            console.error("Forgot Password Error:", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    // @Post("reset-password")
    // @UsePipes(new ValidationPipe({ transform: true }))
    // async resetPassword(@Body() body: ResetPasswordDto, @Req() req, @Res() res) {
    //     const languageCode = req.headers["language_code"];
    //     try {
    //         const tokenData = await this.usersService.findToken(body.token);

    //         if (!tokenData || !tokenData.resetTokenExpires || tokenData.resetTokenExpires < new Date()) {
    //             return commonResponse.customResponse(languageCode, res, "INVALID_TOKEN", 400, {});
    //         }
    //         const user = await this.usersService.findOne(tokenData.email);
    //         if (!user) {
    //             return commonResponse.customResponse(languageCode, res, "USER_NOT_FOUND", 400, {});
    //         }

    //         const hashedPassword = await this.authService.hashPassword(body.new_password);
    //         user.password = hashedPassword;
    //         user.status = "active";
    //         const isPasswordAlreadySet = user.password !== null && user.password !== "";

    //         const updatedUser = await this.usersService.update(user);
    //         if (updatedUser) {
    //             // if (updatedUser?.role?.role_name == "teacher") {
    //             //     let findTeacher = await this.teacherService.getTeacherByObj({ teacher_user_id: updatedUser.id });
    //             //     if (findTeacher) {
    //             //         let id = findTeacher.id;
    //             //         delete findTeacher.id;
    //             //         let updatePayload = { ...findTeacher, password: body.new_password };
    //             //         await this.teacherService.updateTeacher(id, updatePayload);
    //             //     }
    //             // }
    //             // if (updatedUser?.role?.role_name == "parents") {
    //             //     let findParents = await this.parentService.getParentByObj({ parent_user_id: updatedUser.id });
    //             //     if (findParents) {
    //             //         let id = findParents.id;
    //             //         delete findParents.id;
    //             //         let updatePayload = { ...findParents, password: body.new_password };
    //             //         await this.parentService.updateParent(id, updatePayload);
    //             //     }
    //             // }
    //             // if (updatedUser?.role?.role_name == "student") {
    //             //     let findStudent = await this.studentService.getStudentByObj({ student_user_id: updatedUser.id });
    //             //     if (findStudent) {
    //             //         let id = findStudent.id;
    //             //         delete findStudent.id;
    //             //         let updatePayload = { ...findStudent, password: body.new_password };
    //             //         await this.studentService.updateStudent(id, updatePayload);
    //             //     }
    //             // }
    //             // if (updatedUser?.role?.role_name == "admin") {
    //             //     let findStudent = await this.adminService.getAdminByObj({ admin_user_id: updatedUser.id });
    //             //     if (findStudent) {
    //             //         let id = findStudent.id;
    //             //         delete findStudent.id;
    //             //         let updatePayload = { ...findStudent, password: body.new_password };
    //             //         await this.adminService.updateAdmin(id, updatePayload);
    //             //     }
    //             // }
    //             await this.usersService.deleteToken(body.token);
    //             return commonResponse.success(languageCode, res, "PASSWORD_RESET_SUCCESS", 200, {});
    //         } else {
    //             return commonResponse.customResponse(languageCode, res, "SERVER_ERROR", 400, {});
    //         }
    //     } catch (error) {
    //         return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
    //     }
    @UseGuards(JwtAuthGuard)
    @Post("reset-password")
    @UsePipes(new ValidationPipe({ transform: true }))
    async resetPassword(@Body() body: ResetPasswordDto, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            // const tokenData = await this.usersService.findToken(body.token);
            // if (!tokenData) {
            //     return commonResponse.customResponse(languageCode, res, "INVALID_TOKEN", 400, {});
            // }
            const user = await this.usersService.findOne(req.user.email);
            if (!user) {
                return commonResponse.customResponse(languageCode, res, "USER_NOT_FOUND", 400, {});
            }
            const hashedPassword = await this.authService.hashPassword(body.new_password);
            user.password = hashedPassword;
            user.resetToken = null;
            user.resetTokenExpires = null;
            const updatedUser = await this.usersService.update(user);
            if (updatedUser) {
                await this.usersService.deleteToken(body.token);
                return commonResponse.success(languageCode, res, "PASSWORD_CREATED_SUCCESSFULLY", 200, {});
            } else {
                return commonResponse.customResponse(languageCode, res, "SERVER_ERROR", 400, {});
            }
        } catch (error) {
            console.error("Error during password reset:", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Post("change-password")
    @UsePipes(new ValidationPipe({ transform: true }))
    async changePassword(@Body() body: ChangePasswordDto, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            const userId = req.user.userId;
            const { current_Password, new_password } = body;

            const result = await this.authService.changePassword(userId, current_Password, new_password);

            if (result === "password_not_match") {
                return commonResponse.error(languageCode, res, "INVALID_CURRENT_PASSWORD", 400, {});
            }

            return commonResponse.success(languageCode, res, "PASSWORD_CHANGE_SUCCESS", 200, {});
        } catch (error) {
            console.error("Error during change password:", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Post("re-login")
    @UsePipes(new ValidationPipe({ transform: true }))
    async reLogin(@Body() loginDto: ReLoginDto, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            let user = await this.usersService.findById(loginDto.user_id);
            if (user) {
                const loginResponse = await this.authService.login(user);

                return commonResponse.success(languageCode, res, "LOGIN_SUCCESS", 200, loginResponse);
            } else {
                return commonResponse.error(languageCode, res, "NO_USERS_FOUND", 404, {});
            }
        } catch (error) {
            console.error("Error during login:", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post("verify-user")
    async verifyUser(@Req() req: any, @Res() res: any) {
        const languageCode = req.headers["language_code"];
        try {
            // WILL GET TOKEN FROM THE BEARER
            let token = req.headers.authorization;
            token = token.replace("Bearer ", "");

            let user = await this.usersService.findOne(req.user.email);
            if (!user) {
                return commonResponse.error(languageCode, res, "USER_NOT_FOUND", 400, {});
            }

            if (user.status == "verified" && !user?.resetToken && user?.resetTokenExpires) {
                return commonResponse.success(languageCode, res, "USER_IS_ALREADY_VERIFIED", 200, { screen: "setPassword" });
            }

            if (user.status == "verified" && !user.resetToken && !user?.resetTokenExpires) {
                return commonResponse.success(languageCode, res, "USER_IS_ALREADY_VERIFIED", 200, { screen: "login" });
            }

            if (user.status == "verified" && user?.resetToken && user?.resetTokenExpires) {
                return commonResponse.success(languageCode, res, "USER_VERIFIED", 200, { screen: "setPassword" });
            }

            if (String(user?.resetToken) != String(token)) {
                return commonResponse.error(languageCode, res, "INVALID_TOKEN", 400, {});
            }
            // NOT MANAGING TOKEN EXPIRY HERE, B'COZ WE DON'T HAVE FLOW FOR RESEND VERIFICATION AND HENCE ONCE TOKEN GET'S EXPIRED THEN USER CANNOT ABLE TO LOGGED IN AGAIN WITH SAME EMAIL
            let updateData = {
                ...user,
                resetToken: null,
                // resetTokenExpires: null,
                status: "verified",
            };
            let updatedStatus = await this.authService.updateRecord(updateData);
            if (!updatedStatus) {
                return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
            }
            return commonResponse.success(languageCode, res, "USER_VERIFIED", 200, { screen: "setPassword" });
        } catch (error) {
            console.log("🚀 ~ verifyUser ~ error:", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }
}
