import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Not, Repository } from "typeorm";
import { Notification } from "./notification.entity";
import { CreateNotificationDto } from "./dtos/create-notification.dto";
import { UpdateNotificationDto } from "./dtos/update-notification.dto";
import { User } from "../users/user.entity";
import { UsersService } from "../users/user.service";
import { ROLE } from "helper/constants";
import { Institute } from "../institutes/institutes.entity";
import { SocketGateway } from "../calendar_event/event.gateway";
import { EmailService } from "src/services/mail.service";
import { RoleService } from "../role/role.service";
import { Role } from "../role/role.entity";
import { ModuleService } from "../module/module.service";
export interface Event {
    event_name: string;
    school_id: number;
    class_id: number;
    division_id: number;
    created_by: number;
}

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Institute)
        private instituteRepository: Repository<Institute>,
        @Inject(forwardRef(() => SocketGateway)) private readonly socketGateway: SocketGateway,
        @Inject(forwardRef(() => UsersService)) private readonly usersService: UsersService,
        @Inject(forwardRef(() => RoleService)) private readonly roleService: RoleService,
        private readonly moduleServices: ModuleService
    ) {}

    // async checkAndNotifySchoolUserCount(schoolId: number): Promise<void> {
    //     const school = await this.instituteRepository.findOne({
    //         where: { id: schoolId },
    //     });
    //     console.log(`🚀 🚀 <<<<<< ::::: - 🚀 🚀- ::::: >>>>>>  ~ file: notification.service.ts:38 ~ school `, school);

    //     if (!school) {
    //         throw new Error("School not found");
    //     }

    //     const totalUsers = await this.userRepository.count({ where: { school_id: schoolId } });
    //     const maxUsers = school.max_users;

    //     const percentage = (totalUsers / maxUsers) * 100;

    //     console.log(`Checking user count for school "${school.school_name}". Current percentage: ${percentage}%`);
    //     console.log(`Checking totalUsers: ${totalUsers}, maxUsers: ${maxUsers}, percentage: ${percentage}%`);

    //     // Handle 90% notification
    //     if (percentage >= 90 && percentage < 100) {
    //         // Log the condition that triggers the email for 90%
    //         console.log(`Percentage reached 90% for school "${school.school_name}". Sending email notification.`);

    //         const message = `Warning: The number of users in the school "${school.school_name}" has reached 90%.`;
    //         await this.sendNotificationToAdminsAndSuperAdmins(schoolId, message);

    //         // Send email notification to admins
    //         await this.sendEmailToAdminsAndSuperAdmins(schoolId, message, "90%", totalUsers, maxUsers);
    //     }

    //     // Handle 100% notification
    //     if (percentage >= 100) {
    //         // Log the condition that triggers the email for 100%
    //         console.log(`Percentage reached 100% for school "${school.school_name}". Sending email notification.`);

    //         const message = `Alert: The number of users in the school "${school.school_name}" has reached 100%.`;
    //         await this.sendNotificationToAdminsAndSuperAdmins(schoolId, message);

    //         // Send email notification to admins
    //         await this.sendEmailToAdminsAndSuperAdmins(schoolId, message, "100%", totalUsers, maxUsers);

    //         let socketPayload = {
    //             title: "parent",
    //             message: "The user limit has been reached. You cannot add more users at this time.",
    //             school_id: school.id,
    //             created_by: school.created_by,
    //         };
    //         this.socketGateway.emitToAdminsAndSuperAdmins(socketPayload);
    //     }
    // }

    // async sendNotificationToAdminsAndSuperAdmins(schoolId: number, message: string): Promise<void> {
    //     const admins = await this.userRepository.find({
    //         where: { school_id: schoolId, role: In([ROLE.SUB_ADMIN, ROLE.MASTER_ADMIN]) },
    //     });
    //     let module = await this.moduleServices.findModuleByNameShow("schools");
    //     for (const admin of admins) {
    //         await this.createNotification({
    //             title: "User Limit Notification",
    //             message,
    //             school_id: schoolId,
    //             created_by: admin.id,
    //             show_to_all: false,
    //             module_id: module.id,
    //         });
    //     }
    // }

    async sendEmailToAdminsAndSuperAdmins(schoolId: number, message: string, limit: string, totalUsers: number, maxUsers: number): Promise<void> {
        try {
            const roles = await this.roleService.find({
                role_name: In([ROLE.SUB_ADMIN, ROLE.MASTER_ADMIN]),
            });

            const roleIds = roles.map((role) => role.id);
            console.log(`Role IDs for notification: ${roleIds.join(", ")}`);

            const admins = await this.usersService.find({
                where: { school_id: schoolId, role_id: In(roleIds) },
            });

            console.log(`Found ${admins.length} admins for schoolId ${schoolId}.`);

            for (const admin of admins) {
                try {
                    console.log(`Sending email to admin: ${admin.email}`);
                    await this.usersService.sendUserLimitNotification(admin.email, schoolId.toString(), totalUsers, maxUsers);
                    console.log(`Email sent successfully to ${admin.email}`);
                } catch (emailError) {
                    console.error(`Failed to send email to ${admin.email}:`, emailError);
                }
            }
        } catch (error) {
            console.error("Error in sendEmailToAdminsAndSuperAdmins:", error);
        }
    }

    async createNotification(createNotificationDto: CreateNotificationDto): Promise<Notification> {
        try {
            const notification = this.notificationRepository.create(createNotificationDto);

            return await this.notificationRepository.save(notification);
        } catch (error) {
            console.error(error);
            throw new Error("Failed to create notification");
        }
    }

    // private async sendEmailToAdminsAndSuperAdmins(schoolId: number, message: string, limit: string, totalUsers: number, maxUsers: number): Promise<void> {
    //     const admins = await this.usersService.find({
    //         where: { school_id: schoolId, role: In([ROLE.SUB_ADMIN, ROLE.MASTER_ADMIN]) },
    //     });

    //     for (const admin of admins) {
    //         // Pass all necessary arguments to the sendUserLimitNotification method
    //         await this.usersService.sendUserLimitNotification(admin.email, message, totalUsers, maxUsers);
    //     }
    // }

    // async createNotification(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    //     try {
    //         const notification = this.notificationRepository.create(createNotificationDto);

    //         console.log("🚀 ~ file: notification.service.ts:159 ~ NotificationService ~ createNotification ~ notification:", notification);

    //         if (createNotificationDto.show_to_all) {
    //             const users = await this.userRepository.find({
    //                 where: { id: Not(createNotificationDto.created_by) },
    //             });

    //             notification.recipient_count = users.length;
    //         }

    //         return await this.notificationRepository.save(notification);
    //     } catch (error) {
    //         console.error(error);
    //         throw new Error("Failed to create notification");
    //     }
    // }

    // async createEventNotification(event: Event, action: string) {
    //     let module = await this.moduleServices.findModuleByNameShow("calendar");

    //     const notificationData = {
    //         title: `Event ${action}: ${event.event_name}`,
    //         message: `Event ${action}: ${event.event_name}`,
    //         school_id: event.school_id,
    //         grade_id: event.class_id,
    //         grade_class_id: event.division_id,
    //         created_by: event.created_by,
    //         module_id: module.id,
    //     };

    //     const notification = this.notificationRepository.create(notificationData);
    //     return this.notificationRepository.save(notification);
    // }

    /*
     *   Notifications List with Query
     */
    async getNotifications(query: any): Promise<{ list: Notification[]; total: number; unreadCount: number }> {
        const { limit = 50, page = 1, sort = "asc" } = query;
        const skip = (page - 1) * limit;
        try {
            let reqQuery: any = { deleted_at: null };

            if (query.school_id && query.school_id !== undefined) {
                reqQuery.school_id = query.school_id;
            }

            reqQuery.to_user_id = query.to_user_id;
            const [list, total] = await this.notificationRepository.findAndCount({
                where: reqQuery,
                order: { created_at: "DESC" },
                skip,
                take: limit,
                relations: {
                    grade: true,
                    division: true,
                    event: true,
                    creator: false,
                },
                select: {
                    grade: {
                        id: true,
                        grade_number: true,
                    },
                    division: {
                        id: true,
                        name: true,
                    },
                },

                // relations: ["grade", "division", "event", "creator"],
            });
            // if (list.length > 0) {
            //     await this.notificationRepository.update({ id: In(list.map((notification) => notification.id)) }, { is_read: true });
            // }

            const unreadCount = await this.notificationRepository.count({
                where: { ...reqQuery, is_read: false },
            });

            return { list, total, unreadCount };
        } catch (error) {
            console.error(error);
            throw new Error("Failed to retrieve notifications");
        }
    }

    async getNotificationById(id: number): Promise<Notification> {
        try {
            return await this.notificationRepository.findOne({
                where: { id, deleted_at: null },
            });
        } catch (error) {
            console.error(error);
            throw new Error("Notification not found");
        }
    }

    async updateNotification(id: number, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
        try {
            if (updateNotificationDto.is_read === undefined) {
                updateNotificationDto.is_read = false;
            }

            await this.notificationRepository.update(id, updateNotificationDto);

            const updatedNotification = await this.getNotificationById(id);

            return updatedNotification;
        } catch (error) {
            console.error(error);
            throw new Error("Failed to update notification");
        }
    }

    async deleteNotification(id: number): Promise<void> {
        try {
            await this.notificationRepository.update(id, { deleted_at: new Date() });
        } catch (error) {
            console.error(error);
            throw new Error("Failed to soft delete notification");
        }
    }

    async isExist(criteria: any): Promise<boolean> {
        const count = await this.notificationRepository.count({ where: criteria });
        return count > 0;
    }

    async getNotificationsForUser(userId: number, divisionId: number): Promise<Notification[]> {
        return this.notificationRepository.find({
            where: [{ grade_class_id: divisionId }, { show_to_all: true }],
        });
    }

    async readAllUnreadNotification(queryObject: any, updatedData: any) {
        return await this.notificationRepository.update(queryObject, updatedData);
    }

    // Query running in background
    async unreadNotification(query: any) {
        return this.notificationRepository.find(query);
    }

    async createMultiNotification(arrayOfData: any) {
        return await this.notificationRepository.save(arrayOfData);
    }
}
