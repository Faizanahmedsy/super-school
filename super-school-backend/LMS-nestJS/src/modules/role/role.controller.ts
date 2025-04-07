import { Controller, Get, Post, Body, Param, Patch, Req, Res, Delete, Query, UseGuards } from "@nestjs/common";
import { RoleService } from "./role.service";
import { commonResponse } from "helper";
import { CreateRoleDto } from "./dtos/create-role.dto";
import { UpdateRoleDto } from "./dtos/update-role.dto";
import { Role } from "./role.entity";
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/decorator/role_decorator";
import { ROLE } from "helper/constants";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("role")
@ApiBearerAuth()
@ApiTags("Role")
export class RoleController {
    constructor(private roleService: RoleService) {}

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Get("/list")
    @ApiQuery({ name: "sort", required: false, type: String, example: "asc", description: "Sort order (asc/desc)" })
    @ApiQuery({ name: "limit", required: false, type: Number, example: 10, description: "Limit the number of results" })
    @ApiQuery({ name: "page", required: false, type: Number, example: 1, description: "Page number for pagination" })
    async getRoles(@Req() req, @Res() res, @Query() query: any) {
        const languageCode = req.headers["language_code"];
        try {
            let list = await this.roleService.getRoles(query);

            if (list) {
                return commonResponse.success(languageCode, res, "ROLE_LIST", 200, list);
            } else {
                return commonResponse.error(languageCode, res, "ROLE_LIST_ERROR", 400, {});
            }
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Post("/create")
    async createRole(@Req() req, @Res() res, @Body() createRoleDto: CreateRoleDto) {
        const languageCode = req.headers["language_code"];
        try {
            const newRole = await this.roleService.createRoleWithPermissions(createRoleDto, req.user.id);

            if (newRole) {
                return commonResponse.success(languageCode, res, "ROLE_CREATED", 200, newRole);
            } else {
                return commonResponse.error(languageCode, res, "ROLE_CREATE_ERROR", 400, {});
            }
        } catch (error) {
            console.log("role permission", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, { error: error.message });
        }
    }
}
