import { Controller, Get, Body, Param, Req, Res, UseGuards, NotFoundException } from "@nestjs/common";
import { CityService } from "./city.service";
import { CreateCityDto } from "./dtos/create-city.dto";
import { UpdateCityDto } from "./dtos/update-city.dto";
import { commonResponse } from "helper";
import { Request, Response } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/role-auth-guard";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/decorator/role_decorator";
import { ROLE } from "helper/constants";

@Controller("city")
@ApiBearerAuth()
@ApiTags("Districts")
export class CityController {
    constructor(private cityService: CityService) {}

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Get("/list")
    @ApiQuery({ name: "sort", required: false, type: String, example: "asc", description: "Sort order (asc/desc)" })
    @ApiQuery({ name: "limit", required: false, type: Number, example: 10, description: "Limit the number of results" })
    @ApiQuery({ name: "page", required: false, type: Number, example: 1, description: "Page number for pagination" })
    async getAllCities(@Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const { sort = "asc", limit = 10, page = 1 } = req.query;
            const cities = await this.cityService.getAllCities({ sort, limit, page });
            if (cities && cities.length > 0) {
                return commonResponse.success(languageCode, res, "CITY_LIST", 200, cities);
            } else {
                return commonResponse.error(languageCode, res, "NO_CITIES_FOUND", 404, {});
            }
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Get("list/:state_id")
    async getCitiesByStateId(@Param("state_id") state_id: number, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const cities = await this.cityService.getCitiesByStateId(state_id);
            return commonResponse.success(languageCode, res, " CITIES_RETRIEVED", 200, cities);
        } catch (error) {
            if (error instanceof NotFoundException) {
                return commonResponse.error(languageCode, res, "NO_CITIES_FOUND", 404, {});
            }
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }
}
