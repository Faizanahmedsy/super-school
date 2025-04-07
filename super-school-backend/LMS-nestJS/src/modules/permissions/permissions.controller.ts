import { Controller, Get, Post, Body, Param, Patch, Delete, Req, Res, UseGuards, Query } from "@nestjs/common";
import { PermissionsService } from "./permissions.service";
import { CreatePermissionDto } from "../permissions/dtos/create-permissions.dto";
import { UpdatePermissionDto } from "../permissions/dtos/update-permission.dto";
import { commonResponse } from "helper";
import e, { Request, Response } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/role-auth-guard";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/decorator/role_decorator";
import { ROLE } from "helper/constants";
import { AuditLogService } from "../audit_log/audit-log.service";

@Controller("permissions")
@ApiBearerAuth()
@ApiTags("Permissions")
export class PermissionController {
    constructor(private readonly permissionsService: PermissionsService, private readonly auditLogService: AuditLogService) {}

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Post("create")
    async createPermission(@Body() createPermissionDto: CreatePermissionDto, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const existingPermission = await this.permissionsService.isExist({
                role_id: createPermissionDto.role_id,
                module_id: createPermissionDto.module_id,
            });

            if (existingPermission) {
                return commonResponse.error(languageCode, res, "PERMISSION_ALREADY_EXISTS", 409, {});
            }
            createPermissionDto["created_by"] = req.user.userId;
            const newPermission = await this.permissionsService.createPermission(createPermissionDto);
            await this.auditLogService.create({
                action: "CREATE",
                message: `Permission ${newPermission.module_id} created.`,
                old_data: null,
                new_data: newPermission,
                action_user_id: req.user.userId,
                role_id: newPermission.role_id,
            });
            return commonResponse.success(languageCode, res, "PERMISSION_CREATED", 201, newPermission);
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Get("list")
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
    @ApiQuery({ name: "role_id", required: false, type: Number, example: 1, description: "Filter by role_id" })
    @ApiQuery({ name: "module_id", required: false, type: Number, example: 1, description: "Filter by module_id" })
    async getPermissions(@Req() req: Request, @Res() res: Response, @Query() query: any) {
        const languageCode = req.headers["language_code"];
        try {
            const list = await this.permissionsService.getPermissions(query);
            if (list) {
                return commonResponse.success(languageCode, res, "PERMISSION_LIST", 200, list);
            } else {
                return commonResponse.error(languageCode, res, "NO_PERMISSIONS_FOUND", 404, {});
            }
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Get(":id")
    async getPermissionById(@Param("id") id: number, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const permission = await this.permissionsService.getPermissionById(id);
            if (permission) {
                return commonResponse.success(languageCode, res, "PERMISSION_DETAILS", 200, permission);
            } else {
                return commonResponse.error(languageCode, res, "NO_PERMISSION_FOUND", 404, {});
            }
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Patch("patch/:id")
    async updatePermission(@Param("id") id: number, @Body() updatePermissionDto: UpdatePermissionDto, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            updatePermissionDto["updated_by"] = req.user.userId;
            const checkExist = await this.permissionsService.getPermissionById(id);
            if (!checkExist) {
                return commonResponse.error(languageCode, res, "NO_PERMISSION_FOUND", 404, {});
            }
            let oldBatch = { ...checkExist };
            const updatedPermission = await this.permissionsService.updatePermission(id, updatePermissionDto);
            if (updatedPermission) {
                await this.auditLogService.create({
                    action: "UPDATE",
                    message: `Permisssion ${updatedPermission.module_id} updated.`,
                    old_data: oldBatch,
                    new_data: updatedPermission,
                    role_id: updatedPermission.role_id,

                    action_user_id: req.user.userId,
                });

                return commonResponse.success(languageCode, res, "PERMISSION_UPDATED_SUCCESS", 200, updatedPermission);
            } else {
                return commonResponse.error(languageCode, res, "NO_PERMISSION_FOUND", 404, {});
            }
        } catch (error) {
            console.log("updatePermissionError", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Delete("delete/:id")
    async deletePermission(@Param("id") id: number, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const permissionExists = await this.permissionsService.isExist({ id: id });
            if (!permissionExists) {
                return commonResponse.error(languageCode, res, "PERMISSION_NOT_FOUND", 404, {});
            }
            let oldData = { ...permissionExists };
            await this.permissionsService.deletePermission(id);
            const deletedAt = new Date();

            const auditLogData = {
                action: "DELETE",
                message: `Permission ${permissionExists.module_id} deleted.`,
                old_data: oldData,
                new_data: null,
                action_user_id: req.user.userId,
                role_id: permissionExists.role_id,

                deleted_at: deletedAt,
            };

            await this.auditLogService.create(auditLogData);

            return commonResponse.success(languageCode, res, "PERMISSION_DELETED_SUCCESS", 200, {});
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Get("get-by-institute/:id")
    async getInstitute(@Param("id") id: number, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            let query = { institute_id: id };
            const list = await this.permissionsService.getPermissionsWithoutPagination(query);
            if (list) {
                return commonResponse.success(languageCode, res, "PERMISSION_LIST", 200, list);
            } else {
                return commonResponse.error(languageCode, res, "NO_PERMISSIONS_FOUND", 404, {});
            }
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }
}
