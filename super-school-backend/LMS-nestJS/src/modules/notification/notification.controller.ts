import { Controller, Get, Post, Body, Param, Patch, Delete, Query, Req, Res, UseGuards, Put } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { commonResponse } from "helper";
import { CreateNotificationDto } from "./dtos/create-notification.dto";
import { UpdateNotificationDto } from "./dtos/update-notification.dto";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/decorator/role_decorator";
import { ROLE } from "helper/constants";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("notification")
@ApiBearerAuth()
@ApiTags("Notification")
export class NotificationController {
    constructor(private notificationService: NotificationService) {}

    // @UseGuards(JwtAuthGuard)
    // @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    // @Post("/create")
    // @ApiBody({
    //     description: "Create Notification",
    //     type: CreateNotificationDto,
    // })
    // @ApiOperation({ summary: "Create a new notification" })
    // @ApiResponse({ status: 200, description: "Notification created successfully" })
    // @ApiResponse({ status: 400, description: "Failed to create notification" })
    // @ApiResponse({ status: 500, description: "Internal server error" })
    // async createNotification(@Body() createNotificationDto: CreateNotificationDto, @Req() req, @Res() res) {
    //     const languageCode = req.headers["language_code"] || "en";
    //     try {
    //         const notification = await this.notificationService.createNotification(createNotificationDto);
    //         return commonResponse.success(languageCode, res, "NOTIFICATION_CREATED", 200, notification);
    //     } catch (error) {
    //         console.error(error);
    //         return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
    //     }
    // }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.STUDENT, ROLE.PARENTS, ROLE.DEPARTMENT_OF_EDUCTION)
    @Get("/list")
    @ApiQuery({ name: "sort", required: false, type: String, example: "asc", description: "Sort order (asc/desc)" })
    @ApiQuery({ name: "limit", required: false, type: Number, example: 10, description: "Limit the number of results" })
    @ApiQuery({ name: "page", required: false, type: Number, example: 1, description: "Page number for pagination" })
    async getNotifications(@Req() req, @Res() res, @Query() query: any) {
        const languageCode = req.headers["language_code"] || "en";

        console.log("🚀 ~ file: notification.controller.ts:48 ~ NotificationController ~ getNotifications ~ req.user:", req.user);
        try {
            if (req.user.role_name == "admin") {
                query.school_id = req.user.institute_id;
            }
            query.to_user_id = req.user.userId;
            const result = await this.notificationService.getNotifications(query);
            if (result && result.list.length > 0) {
                return commonResponse.success(languageCode, res, "NOTIFICATION_LIST", 200, result);
            } else {
                return commonResponse.error(languageCode, res, "NO_NOTIFICATIONS_FOUND", 400, {});
            }
        } catch (error) {
            console.error(error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Get("/unread-count")
    async fetchUnreadNotificationCount(@Req() req: any, @Res() res: any) {
        const languageCode = req.headers["language_code"] || "en";
        try {
            let fetchAllNotification = await this.notificationService.unreadNotification({ where: { to_user_id: req.user.userId, is_read: false } });
            if (!fetchAllNotification?.length) {
                return commonResponse.success(languageCode, res, "UNREAD_NOTIFICATION", 200, { count: 0 });
            }
            return commonResponse.success(languageCode, res, "UNREAD_NOTIFICATION", 200, { count: fetchAllNotification?.length || 0 });
        } catch (error) {
            console.log("🚀 ~ NotificationController ~ fetchUnreadNotificationCount ~ error:", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.STUDENT, ROLE.PARENTS, ROLE.DEPARTMENT_OF_EDUCTION)
    @Get(":id")
    @ApiParam({ name: "id", required: true, type: Number, example: 1, description: "Notification ID" })
    async getNotificationById(@Param("id") id: number, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"] || "en";
        try {
            const notification = await this.notificationService.getNotificationById(id);
            if (notification) {
                return commonResponse.success(languageCode, res, "NOTIFICATION_DETAILS", 200, notification);
            } else {
                return commonResponse.error(languageCode, res, "NO_NOTIFICATIONS_FOUND", 404, {});
            }
        } catch (error) {
            console.error(error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    /*
     *   Update notification read status
     */
    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Patch(":id")
    @ApiBody({
        description: "Update notification read status flag",
        type: UpdateNotificationDto,
    })
    @ApiOperation({
        summary: "Update notification read status",
        description: "Updates the read status of a specific notification by ID",
    })
    @ApiResponse({ status: 200, description: "Notification updated successfully" })
    @ApiResponse({ status: 400, description: "Failed to update notification" })
    @ApiResponse({ status: 500, description: "Internal server error" })
    @ApiParam({ name: "id", required: true, type: Number, example: 1, description: "Notification ID" })
    async updateNotification(@Param("id") id: number, @Body() updateNotificationDto: UpdateNotificationDto, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"] || "en";
        try {
            const checkExist = await this.notificationService.isExist({ id });
            if (!checkExist) {
                return commonResponse.error(languageCode, res, "NO_NOTIFICATIONS_FOUND", 404, {});
            }
            const updatedNotification = await this.notificationService.updateNotification(id, updateNotificationDto);
            return commonResponse.success(languageCode, res, "NOTIFICATION_UPDATED", 200, updatedNotification);
        } catch (error) {
            console.error(error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Delete(":id")
    @ApiParam({ name: "id", required: true, type: Number, example: 1, description: "Notification ID" })
    async deleteNotification(@Param("id") id: number, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"] || "en";
        try {
            const checkExist = await this.notificationService.isExist({ id });
            if (!checkExist) {
                return commonResponse.error(languageCode, res, "NO_NOTIFICATIONS_FOUND", 404, {});
            }
            await this.notificationService.deleteNotification(id);
            return commonResponse.success(languageCode, res, "NOTIFICATION_DELETED", 200, {});
        } catch (error) {
            console.error(error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Put("/read-all")
    async readAllNotification(@Req() req: any, @Res() res: any) {
        const languageCode = req.headers["language_code"] || "en";
        try {
            let fetchAllNotification = await this.notificationService.unreadNotification({ where: { to_user_id: req.user.userId, is_read: false } });
            if (!fetchAllNotification) {
                console.log("🚀 ~ NotificationController ~ readAllNotification ~ fetchAllNotification:", fetchAllNotification);
                return commonResponse.success(languageCode, res, "ALL_NOTIFICATION_READ", 200, {});
            }
            let payload = {
                is_read: true,
            };
            let notifications = await this.notificationService.readAllUnreadNotification({ to_user_id: req.user.userId, is_read: false }, payload);
            if (!notifications) {
                return commonResponse.success(languageCode, res, "SERVER_ERROR", 400, {});
            }
            return commonResponse.success(languageCode, res, "ALL_NOTIFICATION_READ", 200, {});
        } catch (error) {
            console.log("🚀 ~ NotificationController ~ readAllNotification ~ error:", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }
}
