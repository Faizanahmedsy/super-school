import { Controller, Get, Post, Body, Param, Patch, Delete, Req, Res, UseGuards, Query } from "@nestjs/common";
import { ModuleService } from "./module.service";
import { CreateModuleDto } from "../module/dtos/create-module.dto";
import { UpdateModuleDto } from "../module/dtos/update-module.dto";
import { commonResponse } from "helper";
import { Request, Response } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/decorator/role_decorator";
import { RolesGuard } from "../auth/role-auth-guard";
import { ROLE } from "helper/constants";
import { AuditLogService } from "../audit_log/audit-log.service";

@Controller("module")
@ApiBearerAuth()
@ApiTags("Module")
export class ModuleController {
    constructor(private moduleService: ModuleService, private readonly auditLogService: AuditLogService) {}

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Get("/list")
    @ApiQuery({ name: "sort", required: false, type: String, example: "asc", description: "Sort order (asc/desc)" })
    @ApiQuery({ name: "limit", required: false, type: Number, example: 10, description: "Limit the number of results" })
    @ApiQuery({ name: "page", required: false, type: Number, example: 1, description: "Page number for pagination" })
    async getModules(@Req() req: Request, @Res() res: Response, @Query() query: any) {
        const languageCode = req.headers["language_code"];
        try {
            const modules = await this.moduleService.getModules(query);
            if (modules && modules.length > 0) {
                return commonResponse.success(languageCode, res, "MODULE_LIST", 200, modules);
            } else {
                return commonResponse.error(languageCode, res, "NO_MODULES_FOUND", 404, {});
            }
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Post("create")
    async createModule(@Body() createModuleDto: CreateModuleDto, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        createModuleDto["created_by"] = req.user.userId;

        if (!req.user || !req.user.userId) {
            return commonResponse.error(languageCode, res, "USER_NOT_AUTHENTICATED", 401, {});
        }

        const createdBy = req.user.userId;

        const existingModule = await this.moduleService.findModuleByNameShow(createModuleDto.module_name);

        if (existingModule) {
            return commonResponse.error(languageCode, res, "MODULE_ALREADY_EXISTS", 400, {});
        }

        const module = await this.moduleService.createModuleWithPermissions(createModuleDto, createdBy);

        return commonResponse.success(languageCode, res, "MODULE_CREATED", 201, module);
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Delete(":id")
    async deleteModule(@Param("id") id: number, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const module = await this.moduleService.deleteModule(id);
            if (module) {
                return commonResponse.success(languageCode, res, "MODULE_DELETED", 200, module);
            } else {
                return commonResponse.error(languageCode, res, "NO_MODULES_FOUND", 404, {});
            }
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }
}
