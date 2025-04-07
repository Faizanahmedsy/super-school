import { Injectable, NotFoundException, ConflictException, InternalServerErrorException, Inject, forwardRef } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, MoreThan, Repository } from "typeorm";
import { User } from "./user.entity";
import * as bcrypt from "bcrypt";
import { CreateUserDto } from "../users/dtos/create-users.dto";
import { UpdateUserDto } from "../users/dtos/update-users.dto";
import { join } from "path";
import * as fs from "fs";
import * as handlebars from "handlebars";
import { JwtService } from "@nestjs/jwt";
import { EmailService } from "src/services/mail.service";
// import { NotificationService } from "../notification/notification.service";
import { SocketGateway } from "../calendar_event/event.gateway";
import { ParentService } from "../parents/parents.service";
import { RoleService } from "../role/role.service";
import { Role } from "../role/role.entity";
import { AdminService } from "../admin/admin.service";
import { GeneralSettingService } from "../general_setting/general-setting.service";
@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private mailerService: EmailService,
        private jwtService: JwtService,
        // private notificationService: NotificationService,
        private parentService: ParentService,
        private adminService: AdminService,
        private generalSettingServices: GeneralSettingService,
        @InjectRepository(Role) private roleRepository: Repository<Role>,
        @Inject(forwardRef(() => SocketGateway)) private readonly socketGateway: SocketGateway
    ) {}

    // async isExist(query: Partial<Omit<User, "parents">>): Promise<User | undefined> {
    //     return await this.usersRepository.findOne({ where: query });
    // }

    async isExist(query: FindOptionsWhere<User>): Promise<User | undefined> {
        return await this.usersRepository.findOne({ where: query });
    }

    async findManyByQuery(query) {
        return await this.usersRepository.find({ where: query });
    }

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        const existingUser = await this.isExist({ email: createUserDto.email });

        if (existingUser) {
            throw new ConflictException("User already exists");
        }

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        const newUser = this.usersRepository.create({
            ...createUserDto,
            password: hashedPassword,
        });

        const savedUser = await this.usersRepository.save(newUser);
        // let socketPayload = {
        //     school_id: savedUser.school_id,
        //     message: `New user created: ${savedUser.email}`,
        //     title: "New User Created",
        //     created_by: savedUser.id,
        // };
        // await this.notificationService.createNotification(socketPayload);

        // await this.socketGateway.emitToAdminsAndSuperAdmins(socketPayload);
        return savedUser;
    }

    async getUsers(sort: "asc" | "desc" = "asc"): Promise<any[]> {
        const users = await this.usersRepository
            .createQueryBuilder("user")
            .leftJoinAndSelect("user.role", "role")
            .select([
                "user.id",
                "user.email",
                "user.password",
                "user.user_name",
                "user.role_id",
                "user.status",
                "user.resetToken",
                "user.resetTokenExpires",
                "user.created_by",
                "user.updated_by",
                "user.deleted_by",
                "user.created_at",
                "user.updated_at",
                "user.deleted_at",
                "role.role_name",
            ])
            .where("user.deleted_at IS NULL")
            .orderBy("user.created_at", sort.toUpperCase() as "ASC" | "DESC")
            .getMany();

        return users.map((user) => ({
            id: user.id,
            email: user.email,
            password: user.password,
            user_name: user.user_name,
            role_id: {
                id: user.role_id,
                role_name: user.role ? user.role.role_name : null,
            },
            status: user.status,
            resetToken: user.resetToken,
            resetTokenExpires: user.resetTokenExpires,
            created_by: user.created_by,
            updated_by: user.updated_by,
            deleted_by: user.deleted_by,
            created_at: user.created_at,
            updated_at: user.updated_at,
            deleted_at: user.deleted_at,
        }));
    }

    // async getUserById(userId: number): Promise<User> {
    //     const user = await this.usersRepository.findOne({
    //         where: { id: userId, deleted_at: null },
    //     });

    //     if (!user) {
    //         throw new NotFoundException(`User with ID ${userId} not found`);
    //     }

    //     return user;
    // }

    async getUserById(userId: number): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: { id: userId, deleted_at: null },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        return user;
    }

    async updateUser(userId: number, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.getUserById(userId);
        Object.assign(user, updateUserDto);

        if (updateUserDto.password) {
            user.password = await bcrypt.hash(updateUserDto.password, 10);
        }

        const updatedUser = await this.usersRepository.save(user);

        return updatedUser;
    }

    async updateDepartmentUser(userId: number, updateUserDto: UpdateUserDto) {
        let user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            return null;
        }
        let data = Object.assign(user, updateUserDto);
        return await this.usersRepository.save(data);
    }

    async deleteUser(id: number): Promise<void> {
        const user = await this.getUserById(id);
        await this.usersRepository.softDelete(id);
    }
    // async deleteUser(userId: number): Promise<void> {
    //     const user = await this.userRepository.findOne(userId);
    //     if (user) {
    //         await this.userRepository.remove(user);

    //         // Check the new user count for the school
    //         await this.checkAndNotifySchoolUserCount(user.school_id);
    //     }
    // }

    async deactivateUser(id: number): Promise<User | null> {
        const user = await this.getUserById(id);

        if (!user) {
            return null;
        }

        user.status = "inactive";

        return this.usersRepository.save(user);
    }

    async restoreUser(id: number): Promise<User> {
        await this.usersRepository.restore(id);
        const restoredUser = await this.getUserById(id);

        return restoredUser;
    }

    async findOne(email: string): Promise<User | undefined> {
        try {
            const user = await this.usersRepository.findOne({
                where: { email, deleted_at: null },
            });

            return user;
        } catch (error) {
            console.error("Error finding user by email:", error);
            throw new InternalServerErrorException("Error finding user");
        }
    }

    async find(query: any): Promise<User[]> {
        return this.usersRepository.find(query); // assuming you're using TypeORM or another ORM
    }

    async findOneWithRole(email: string) {
        return this.usersRepository.findOne({
            where: { email },
            relations: ["role", "institute"],
        });
    }

    async findById(userId: number): Promise<User | undefined> {
        return await this.usersRepository.findOne({
            where: { id: userId, deleted_at: null },
            relations: ["role", "institute"],
        });
    }

    async update(user: User): Promise<User> {
        return await this.usersRepository.save(user);
    }

    async create(CreateUserDto) {
        // if (CreateUserDto && CreateUserDto.parents) {
        //     try {
        //         if (typeof CreateUserDto.parents === "string") {
        //             const parsedParents = JSON.parse(CreateUserDto.parents);

        //             if (!Array.isArray(parsedParents)) {
        //                 CreateUserDto.parents = [parsedParents];
        //             } else {
        //                 CreateUserDto.parents = parsedParents;
        //             }
        //         }

        //         for (let parent of CreateUserDto.parents) {
        //             if (!parent.user_name) {
        //                 parent.user_name = `${parent.first_name}_${parent.last_name || "parent"}`;
        //             }

        //             let role = await this.getRoleIdByName("parents");
        //             parent.role_id = role;

        //             const parentUser = await this.usersRepository.save(parent);

        //             if (parentUser) {
        //                 CreateUserDto.parent_id = parentUser.id;
        //             }
        //         }
        //     } catch (error) {
        //         console.error("Error parsing parents:", error);
        //         throw new Error("Invalid parents format");
        //     }
        // }

        // CreateUserDto.role_id = await this.getRoleIdByName("student");

        const studentUser = await this.usersRepository.save(CreateUserDto);

        // await this.notificationService.checkAndNotifySchoolUserCount(studentUser.school_id);

        return studentUser;
    }

    // async create(CreateUserDto) {
    //     console.log(`🚀 🚀 <<<<<< ::::: - 🚀 🚀- ::::: >>>>>>  ~ file: user.service.ts:209 ~ CreateUserDto `, CreateUserDto);

    //     // Handle the parents array if it's provided
    //     if (CreateUserDto && CreateUserDto.parents) {
    //         try {
    //             // Parse the parents string to an array of objects
    //             CreateUserDto.parents = JSON.parse(CreateUserDto.parents);

    //             // Iterate over the parents array and create each parent
    //             for (let parent of CreateUserDto.parents) {
    //                 console.log(` parent =>`, parent);

    //                 if (!parent.user_name) {
    //                     parent.user_name = `${parent.first_name}_${parent.last_name || "parent"}`; // Example logic
    //                 }

    //                 // Ensure the parent has the 'PARENT' role
    //                 let role = await this.getRoleIdByName("parents");
    //                 parent.role_id = role;
    //                 console.log(`🚀 🚀 <<<<<< ::::: - 🚀 🚀- ::::: >>>>>>  ~ file: user.service.ts:227 ~ parent `, parent);
    //                 const parentUser = await this.usersRepository.save(parent);

    //                 // Link parent to the student (e.g., using a relationship table or field)
    //                 // If needed, add the parent ID to the student record to associate them
    //                 // Assuming the parent is linked via a parent_id in student record, you can update the student user with the parentId
    //                 if (parentUser) {
    //                     // Example of associating parent to student (modify according to your schema)
    //                     CreateUserDto.parent_id = parentUser.id;
    //                 }
    //             }
    //         } catch (error) {
    //             console.error("Error parsing parents:", error);
    //             throw new Error("Invalid parents format");
    //         }
    //     }

    //     // Delete unnecessary parent field from the student DTO
    //     // delete CreateUserDto?.parent;

    //     // Ensure the student has the 'STUDENT' role
    //     CreateUserDto.role_id = await this.getRoleIdByName("student");

    //     // Save the student user with the proper role_id
    //     const studentUser = await this.usersRepository.save(CreateUserDto);

    //     // After saving student and parents, you may want to trigger notifications or actions
    //     await this.notificationService.checkAndNotifySchoolUserCount(studentUser.school_id);

    //     console.log("studentUser =>", studentUser);
    //     return studentUser;
    // }

    // Helper method to fetch the role ID based on role name
    private async getRoleIdByName(roleName: string): Promise<number> {
        const role = await this.roleRepository.findOne({ where: { role_name: roleName } });
        if (!role) {
            throw new Error(`Role not found for ${roleName}`);
        }
        return role.id;
    }

    async storeResetToken(email: string, token: string, expirationDate: Date): Promise<void> {
        const user = await this.findOne(email);
        if (!user) {
            throw new ConflictException("User not found");
        }
        user.resetToken = token;
        user.resetTokenExpires = expirationDate;

        let response: any = await this.update(user);
        return response;
    }

    async findToken(token: string): Promise<User | undefined> {
        return await this.usersRepository.findOne({
            where: {
                resetToken: token,
            },
        });
    }

    async deleteToken(token: string): Promise<void> {
        const user = await this.findToken(token);
        if (user) {
            user.resetToken = null;
            user.resetTokenExpires = null;
            await this.update(user);
        } else {
        }
    }

    async sendWelComeEmail(email: string, id: number, role_name: string, first_name: string, last_name: string, school_name: string) {
        try {
            //     const token = await this.jwtService.sign({ email: email, id: id });
            //     const expirationDate = new Date();
            //     expirationDate.setHours(expirationDate.getHours() + 1);
            //   await this.storeResetToken(email, token, expirationDate);

            //     const verificationUrl = `${process.env.ADMIN_URL}/reset-password?token=${token}`;

            let generalSetting = await this.generalSettingServices.getSetting();
            let supportEmail = process.env.SUPPORT_EMAIL;
            if (generalSetting) {
                supportEmail = generalSetting.support_email;
            }
            const context = {
                year: new Date().getFullYear(),
                role_name: role_name,
                first_name: first_name,
                last_name: last_name,
                school_name: school_name,
                email: email,
                supportemail: supportEmail,
                logoPath: process.env.LOGO_SERVER_PATH,
            };
            console.log(`🚀 🚀 <<<<<< ::::: - 🚀 🚀- ::::: >>>>>>  ~ file: user.service.ts:385 ~ context `, context);

            const template = handlebars.compile(fs.readFileSync(join(__dirname, "../../../src/views/welcome-email.hbs"), "utf8"));

            const html = template(context);

            const text = "";

            await this.mailerService.sendMail({
                email: email,
                subject: "Welcome to grAIdar",
                text: text,
                html: html,
                template: "welcome-email",
                context: context,
            });
        } catch (error) {
            console.error("sendWelComeEmail", error);
        }
    }

    async verifyEmail(email: string, userId: number): Promise<void> {
        try {
            const token = await this.jwtService.sign({ email, id: userId });
            const expirationDate = new Date();
            expirationDate.setHours(expirationDate.getHours() + 1);

            let response = await this.storeResetToken(email, token, expirationDate);

            const verificationUrl = `${process.env.ADMIN_URL}/reset-password?token=${token}&verify=true`;

            const context = {
                verificationUrl,
                year: new Date().getFullYear(),
                logoPath: process.env.LOGO_SERVER_PATH,
            };

            const templatePath = join(__dirname, "../../../src/templates/verify-email.hbs");

            const template = handlebars.compile(fs.readFileSync(templatePath, "utf8"));

            const html = template(context);

            const text = `Thank you for registering. Please verify your email address by clicking the following link: ${verificationUrl}`;

            await this.mailerService.sendMail({
                email: email,
                subject: "Verify Your Email Address",
                html,
                text,
                template: "verify-email",
                context,
            });
        } catch (error) {
            console.error("Error in verifyEmail function:", error);
            throw new InternalServerErrorException("Failed to send verification email");
        }
    }

    // Function to send user limit notification email
    async sendUserLimitNotification(email: string, school_name: string, totalUsers: number, maxUsers: number) {
        try {
            // Prepare dynamic data context for the email template

            let generalSetting = await this.generalSettingServices.getSetting();
            let supportEmail = process.env.SUPPORT_EMAIL;
            if (generalSetting) {
                supportEmail = generalSetting.support_email;
            }

            const context = {
                year: new Date().getFullYear(),
                school_name: school_name,
                totalUsers: totalUsers,
                maxUsers: maxUsers,
                support_email: supportEmail,
                logoPath: process.env.LOGO_SERVER_PATH,
            };

            // Compile the Handlebars template for the email
            const template = handlebars.compile(fs.readFileSync(join(__dirname, "../../../src/templates/limit-access-email.hbs"), "utf8"));

            // Generate the HTML content by applying the context
            const html = template(context);
            const text = ""; // Optional: Plain text content

            // Mail options for sending email
            await this.mailerService.sendMail({
                email: email,
                subject: "User Limit Notification",
                text: text,
                html: html,
                template: "user-limit-notification",
                context: context,
            });

            // await this.mailerService.sendMail(mailOptions);
            console.log("User Limit Notification email sent successfully!");
        } catch (error) {
            console.error("Error sending User Limit Notification email:", error);
        }
    }

    async resetPassword(token: string, newPassword: string): Promise<string> {
        const user = await this.findToken(token);

        if (!user) {
            throw new NotFoundException("Invalid or expired reset token.");
        }

        const currentDate = new Date();
        if (user.resetTokenExpires < currentDate) {
            throw new NotFoundException("Reset token has expired.");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpires = null;

        await this.update(user);

        return "Password reset successfully.";
    }

    async findUserByRole(roleId: number) {
        return await this.usersRepository.findOne({ where: { role_id: roleId } });
    }
}
