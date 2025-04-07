import { Controller, Get, Body, Req, Res, UseGuards } from "@nestjs/common";
import { StateService } from "./state.service";
import { CreateStateDto } from "./dtos/create-state.dto";
import { UpdateStateDto } from "./dtos/update-state.dto";
import { commonResponse } from "helper";
import { Request, Response } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/role-auth-guard";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/decorator/role_decorator";
import { ROLE } from "helper/constants";

@Controller("state")
@ApiBearerAuth()
@ApiTags("Provinces")
export class StateController {
    constructor(private stateService: StateService) {}

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Get("/list")
    @ApiQuery({ name: "sort", required: false, type: String, example: "asc", description: "Sort order (asc/desc)" })
    @ApiQuery({ name: "sortBy", required: false, type: String, example: "name", description: "Field to sort by (e.g., 'name', 'id')" })
    @ApiQuery({ name: "limit", required: false, type: Number, example: 10, description: "Limit the number of results" })
    @ApiQuery({ name: "page", required: false, type: Number, example: 1, description: "Page number for pagination" })
    async getAllStates(@Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const states = await this.stateService.getAllStates(req.query);
            if (states && states.length > 0) {
                return commonResponse.success(languageCode, res, "STATE_LIST", 200, states);
            } else {
                return commonResponse.error(languageCode, res, "NO_STATES_FOUND", 404, {});
            }
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }
}
