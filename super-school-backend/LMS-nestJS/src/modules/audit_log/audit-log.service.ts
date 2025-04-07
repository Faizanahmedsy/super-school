import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuditLog } from "./audit-log.entity";
import { CreateAuditLogDto } from "./dtos/create-audit-log.dto";

@Injectable()
export class AuditLogService {
    constructor(
        @InjectRepository(AuditLog)
        private readonly auditLogRepository: Repository<AuditLog>
    ) {}

    async create(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
        // if (!createAuditLogDto.school_id) {
        //     throw new Error("School ID is required for the audit log");
        // }
        const auditLog = this.auditLogRepository.create(createAuditLogDto);
        return await this.auditLogRepository.save(auditLog);
    }

    async getAuditLogs(query: any): Promise<any> {
        const page = query.page ? parseInt(query.page, 10) : 1;
        const limit = query.limit ? parseInt(query.limit, 10) : 10;
        const order = query.sort === "desc" ? "DESC" : "ASC";

        const offset = (page - 1) * limit;

        let whereQuery: any = {};

        if (query?.action && query?.action != "") {
            whereQuery.action = query.action;
        }

        if (query?.role_id && query?.role_id != "") {
            whereQuery.role_id = query.role_id;
        }

        if (query.school_id && query.school_id !== undefined) {
            whereQuery.school_id = query.school_id;
            delete query.page;
            delete query.limit;
            delete query.sort;
        }
        whereQuery.deleted_at = null;
        const [logs, totalCount] = await this.auditLogRepository.findAndCount({
            where: whereQuery,
            order: {
                created_at: "DESC",
            },
            skip: offset,
            take: limit,
            relations: ["role", "user", "institute"],
        });

        const totalPages = Math.ceil(totalCount / limit);

        return {
            totalCount,
            totalPages,
            currentPage: page,
            list: logs.map((log) => ({
                id: log.id,
                role_name: log.role?.role_name_show ?? null,
                action: log.action,
                message: log.message,
                old_data: log.old_data,
                new_data: log.new_data,
                action_user: log.user?.user_name ?? null,
                school_id: log.school_id,
                school_name: log.institute?.school_name ?? null,
                created_at: log.created_at,
                updated_at: log.updated_at,
                deleted_at: log.deleted_at,
            })),
        };
    }
}
