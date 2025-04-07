import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/user.service";
import * as bcrypt from "bcrypt";
import { PermissionsService } from "../permissions/permissions.service";
import { InstituteService } from "../institutes/institutes.service";
import { EmailService } from "src/services/mail.service";
import { join } from "path";
import * as fs from "fs";
import * as handlebars from "handlebars";
import { BatchService } from "../batch/batch.service";
import { AdminService } from "../admin/admin.service";
import { TeacherService } from "../teacher/teacher.service";
import { StudentService } from "../student/student.service";
import { ParentService } from "../parents/parents.service";
import { DepartmentUserService } from "../department_user/department_user.service";
import { User } from "../users/user.entity";
import { ROLE, DEFAULT_AVTAR } from "helper/constants";
import { OBSFileService } from "src/services/obs-file.service";
@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private mailerService: EmailService,
        private permissionsService: PermissionsService,
        private instituteService: InstituteService,
        private batchService: BatchService,
        private adminService: AdminService,
        private teacherService: TeacherService,
        private studentService: StudentService,
        private parentService: ParentService,
        private departmentUserService: DepartmentUserService,
        private obsService: OBSFileService
    ) {}

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.usersService.findOneWithRole(email);
        console.log("🚀 ~ file: auth.service.ts:38 ~ AuthService ~ validateUser ~ user:", user);

        if (!user) {
            return "user_not_found";
        }

        if (user.password == null || user.password === "") {
            return "password_not_set";
        }

        const isPasswordMatching = await this.comparePassword(password, user.password);
        if (!isPasswordMatching) {
            return "password_not_match";
        }

        delete user.password;
        return user;
    }

    async login(user: any) {
        if (!user.role) {
            throw new UnauthorizedException("Role not found for the user");
        }
        let earlierUser = { ...user };
        console.log("userdasadaadasdasd", user?.role);
        const roleId = user.role_id;
        const payload = {
            sub: user.id,
            email: user.email,
            role_name: user.role.role_name,
            role_name_show: user?.role?.role_name_show,
            role_id: roleId,
            institute_id: user?.institute?.id ? user?.institute?.id : null,
        };

        const accessToken = this.jwtService.sign(payload, { secret: process.env.JWT_SECRET, expiresIn: "24h" });

        let permissions = [];
        if (
            user.role.role_name == ROLE.TEACHER ||
            user.role.role_name == ROLE.PARENTS ||
            user.role.role_name == ROLE.STUDENT ||
            user.role.role_name == ROLE.SUB_ADMIN ||
            user.role.role_name == ROLE.DEPARTMENT_OF_EDUCTION
        ) {
            let response = await this.permissionsService.getPermissionsWithoutPagination({ role_id: user.role_id });
            if (response && response.length > 0) {
                permissions = response;
            }
        }

        // const institute = await this.instituteService.getInstituteById(user.institute_id);
        console.log("user.role", user.role);
        const themePrimaryColor = user.institute?.themePrimaryColor || "#92400e";
        const themeSecondaryColor = user.institute?.themeSecondaryColor || "#fff7ed";
        let userDetails = {
            id: user.id,
            email: user.email,
            user_name: user.user_name,
            status: user.status,
            role_id: user.role_id,
            role_name: user.role.role_name,
            role_name_show: user?.role?.role_name_show,
            permissions: permissions,
            school: user.institute,
            themePrimaryColor,
            themeSecondaryColor,
            profile_image: "",
        };

        console.log("🚀 ~ file: auth.service.ts:109 ~ AuthService ~ login ~ userDetails:", userDetails);
        const expiresIn = parseInt(process.env.SIGNATURE_EXPIRY); // Link valid for 1 hour

        if (user.role.role_name == ROLE.MASTER_ADMIN) {
            let details: any = { profile_image: "" };
            details.profile_image = DEFAULT_AVTAR.DEFAULT_IMAGE;
            userDetails["details"] = details;
        }

        if (user.role.role_name == ROLE.SUB_ADMIN) {
            let details = await this.adminService.getAdminByObj({ school_admin_user_id: user?.id });
            if (!details) {
                return "USER_NOT_LONGER_EXIST";
            }
            if (details.profile_image && details.profile_image !== null && details.profile_image !== "") {
                // details.profile_image = `${process.env.API_SERVER_PATH}profile/${details.profile_image}`;
                details.profile_image = await this.obsService.getObject(details.profile_image, expiresIn);
            } else {
                details.profile_image = DEFAULT_AVTAR.DEFAULT_IMAGE;
            }

            // fetch school
            let school = await this.instituteService.findSchoolForAuth(details.school_id);
            if (school) {
                userDetails.school["city"] = school.city;
                userDetails.school["province"] = school.state;
                let teachers = await this.teacherService.getTeacherCountBySchool(school.id);
                let learners = await this.studentService.getStudentCountBySchool(school.id);

                userDetails.school["teacherCount"] = teachers ? teachers : 0;
                userDetails.school["learnerCount"] = learners ? learners : 0;
            }
            userDetails["details"] = details;
        }
        if (user.role.role_name == ROLE.TEACHER) {
            let details = await this.teacherService.getTeacherByObj({ teacher_user_id: user?.id });
            if (!details) {
                return "USER_NOT_LONGER_EXIST";
            }
            if (details.profile_image && details.profile_image !== null && details.profile_image !== "") {
                // details.profile_image = `${process.env.API_SERVER_PATH}profile/${details.profile_image}`;
                details.profile_image = await this.obsService.getObject(details.profile_image, expiresIn);
            } else {
                details.profile_image = DEFAULT_AVTAR.DEFAULT_IMAGE;
            }
            userDetails["details"] = details;
        }
        if (user.role.role_name == ROLE.STUDENT) {
            let details = await this.studentService.getStudentForLogin({ student_user_id: user?.id });
            if (!details) {
                return "USER_NOT_LONGER_EXIST";
            }
            if (details.profile_image && details.profile_image !== null && details.profile_image !== "") {
                // details.profile_image = `${process.env.API_SERVER_PATH}profile/${details.profile_image}`;
                details.profile_image = await this.obsService.getObject(details.profile_image, expiresIn);
            } else {
                details.profile_image = DEFAULT_AVTAR.DEFAULT_IMAGE;
            }
            userDetails["details"] = details;
        }
        if (user.role.role_name == ROLE.PARENTS) {
            let details = await this.parentService.getParentForLogin({ parent_user_id: user?.id });
            if (!details) {
                return "USER_NOT_LONGER_EXIST";
            }
            if (details) {
                if (details.profile_image && details.profile_image !== null && details.profile_image !== "") {
                    // details.profile_image = `${process.env.API_SERVER_PATH}profile/${details.profile_image}`;
                    details.profile_image = await this.obsService.getObject(details.profile_image, expiresIn);
                } else {
                    details.profile_image = DEFAULT_AVTAR.DEFAULT_IMAGE;
                }
                userDetails["details"] = details;
            }
        }
        if (user.role.role_name == ROLE.DEPARTMENT_OF_EDUCTION) {
            let details = await this.departmentUserService.getDepartmentByObj({ department_user_id: user?.id });
            if (!details) {
                return "USER_NOT_LONGER_EXIST";
            }
            if (details.profile_image && details.profile_image !== null && details.profile_image !== "") {
                // details.profile_image = `${process.env.API_SERVER_PATH}profile/${details.profile_image}`;
                details.profile_image = await this.obsService.getObject(details.profile_image, expiresIn);
            } else {
                details.profile_image = DEFAULT_AVTAR.DEFAULT_IMAGE;
            }
            userDetails["details"] = details;
        }
        if (user?.institute?.id) {
            let getCurrentBatch = await this.batchService.getBatchByQuery({ school_id: user?.institute?.id, is_active: true });
            if (getCurrentBatch) {
                userDetails["cur_batch"] = getCurrentBatch;
            }
        }
        // Managing is FirstTime login flow over multiple time click on resetpassword verify email and render screen to be of setpassword if never logged in
        user.resetTokenExpires = null;
        await this.usersService.update(earlierUser);
        return {
            access_token: accessToken,
            user: userDetails,
        };
    }

    async forgotPassword(email: string) {
        const user = await this.usersService.findOne(email);
        if (!user) {
            return { error: "user_not_found" };
        }

        const token = await this.jwtService.sign({ email: user.email, id: user.id });
        const expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + 1);

        await this.usersService.storeResetToken(email, token, expirationDate);

        const resetUrl = `${process.env.ADMIN_URL}/reset-password?token=${token}`;
        const logoPath = process.env.LOGO_SERVER_PATH;
        const text = "Please click the following link to reset your password.";
        await this.sendResetEmail(email, resetUrl, text, logoPath);

        return { email, token };
    }

    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }

    async comparePassword(password: string, storedPasswordHash: string): Promise<boolean> {
        return bcrypt.compare(password, storedPasswordHash);
    }

    private async sendResetEmail(email: string, resetUrl: string, text: string, logoPath: string) {
        const template = handlebars.compile(fs.readFileSync(join(__dirname, "../../../src/templates/reset-password.hbs"), "utf8"));
        const year = new Date().getFullYear();
        let html = template({
            resetUrl,
            year,
            logoPath,
        });

        await this.mailerService.sendMail({
            email: email,
            subject: "Password Reset",
            text: text,
            html: html,
            template: "",
            context: {},
        });
    }

    async changePassword(userId: number, current_Password: string, new_password: string): Promise<string | void> {
        const user = await this.usersService.findById(userId);

        if (!user) {
            throw new Error("User not found");
        }

        const isPasswordMatching = await bcrypt.compare(current_Password, user.password);
        if (!isPasswordMatching) {
            return "password_not_match";
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);
        user.password = hashedPassword;

        await this.usersService.update(user);
    }
    async updateRecord(payload: User) {
        return await this.usersService.update(payload);
    }
}
