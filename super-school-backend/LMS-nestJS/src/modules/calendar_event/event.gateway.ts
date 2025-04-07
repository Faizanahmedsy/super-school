import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";
import { forwardRef, Inject, Logger } from "@nestjs/common";
import { NotificationService } from "../notification/notification.service";
import { ModuleService } from "../module/module.service";
@WebSocketGateway({
    cors: {
        origin: "*",
    },
})
export class SocketGateway {
    @WebSocketServer()
    server: Server;

    private logger = new Logger(SocketGateway.name);

    constructor(
        @Inject(forwardRef(() => ModuleService)) private readonly moduleServices: ModuleService,
        @Inject(forwardRef(() => NotificationService)) private readonly notificationService: NotificationService
    ) {}

    // emitSchoolEventUpdate(gradeId: number, eventData: any) {
    //     this.server.to(`school_${gradeId}`).emit("event_update", eventData);
    // }

    // emitClassEventUpdate(gradeId: number, eventData: any) {
    //     this.server.to(`grade_${gradeId}`).emit("event_update", eventData);
    // }

    // emitDivisionEventUpdate(divisionId: number, eventData: any) {
    //     this.server.to(`division_${divisionId}`).emit("event_update1", eventData);
    // }

    // async emitToAdminsAndSuperAdmins(data) {
    //     // let module = await this.moduleServices.findModuleByNameShow("calendar");
    //     // data.module_id = module.id;
    //     // await this.notificationService.createNotification(data);
    //     this.server.to(`school_${data.school_id}_admins`).emit("notification", data.message);
    //     this.server.to(`school_${data.school_id}_superadmins`).emit("notification", data.message);
    //     this.logger.log(`Notification sent to admins and superadmins of school ${data.school_id}: ${data.message}`);
    // }

    async commonNotificationForAllModule(school_id: number) {
        this.server.emit("notification_test", { school_id: school_id });
    }

    // handleConnection(client: any, ...args: any[]) {
    //     const gradeId = client.handshake.query.gradeId;
    //     const divisionId = client.handshake.query.divisionId;

    //     this.logger.log(`Handshake details: gradeId=${gradeId}, divisionId=${divisionId}`);

    //     if (gradeId) {
    //         this.logger.log(`Client joining class room: grade_${gradeId}`);
    //         client.join(`grade_${gradeId}`);
    //     } else if (divisionId) {
    //         this.logger.log(`Client joining division room: division_${divisionId}`);
    //         client.join(`division_${divisionId}`);
    //     } else {
    //         this.logger.warn("Neither gradeId nor divisionId provided in connection");
    //     }
    //     this.logger.log(`Client connected with gradeId=${gradeId} and divisionId=${divisionId}`);

    //     const schoolId = client.handshake.query.schoolId;
    //     if (schoolId) {
    //         client.join(`school_${schoolId}_admins`);
    //         client.join(`school_${schoolId}_superadmins`);
    //         this.logger.log(`Client joined rooms: school_${schoolId}_admins, school_${schoolId}_superadmins`);
    //     }
    // }

    handleDisconnect(client: any) {
        this.logger.log("Client disconnected:", client.id);
    }
}
