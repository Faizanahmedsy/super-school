import { Controller, Get, Post, Body, Req, Res, Query, UseGuards } from "@nestjs/common";
import { AuditLogService } from "./audit-log.service";
import { commonResponse } from "helper";
import { ApiBearerAuth, ApiTags, ApiQuery, ApiBody } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "src/decorator/role_decorator";
import { ROLE } from "helper/constants";
import { CreateAuditLogDto } from "./dtos/create-audit-log.dto";

@Controller("audit-log")
@ApiBearerAuth()
@ApiTags("Audit Log")
export class AuditLogController {
    constructor(private readonly auditLogService: AuditLogService) {}

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Post("/create")
    @ApiBody({ type: CreateAuditLogDto })
    async createAuditLog(@Req() req, @Res() res, @Body() createAuditLogDto: CreateAuditLogDto) {
        const languageCode = req.headers["language_code"];
        try {
            const log = await this.auditLogService.create(createAuditLogDto);
            return commonResponse.success(languageCode, res, "AUDIT_LOG_CREATED_SUCCESS", 201, log);
        } catch (error) {
            return commonResponse.error(languageCode, res, "AUDIT_LOG_CREATION_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Get("/list")
    @ApiQuery({
        name: "school_id",
        required: false,
        type: Number,
        example: "1",
        description: "School Id",
    })
    @ApiQuery({
        name: "sort",
        required: false,
        type: String,
        example: "asc",
        description: "Sort order (asc/desc)",
    })
    @ApiQuery({
        name: "limit",
        required: false,
        type: Number,
        example: 10,
        description: "Limit the number of results",
    })
    @ApiQuery({
        name: "page",
        required: false,
        type: Number,
        example: 1,
        description: "Page number for pagination",
    })
    async getAuditLogs(@Req() req, @Res() res, @Query() query: any) {
        const languageCode = req.headers["language_code"];
        try {
            const logs = await this.auditLogService.getAuditLogs(query);

            if (logs) {
                return commonResponse.success(languageCode, res, "AUDIT_LOG_LIST", 200, logs);
            } else {
                return commonResponse.error(languageCode, res, "AUDIT_LOG_LIST_ERROR", 400, {});
            }
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }
}
