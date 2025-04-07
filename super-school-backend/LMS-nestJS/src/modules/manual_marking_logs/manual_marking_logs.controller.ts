import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, Res, UseGuards } from "@nestjs/common";
import { ManualMarkingLogService } from "./manual_marking_logs.service";

import { CreateManualMarkingLogDto } from "./dtos/create-manual-marking-logs.dto";
import { UpdateManualMarkingLogDto } from "./dtos/updtae-manual-marking-logs.dto";
import { commonResponse } from "helper";
import { Request, Response } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/decorator/role_decorator";
import { RolesGuard } from "../auth/role-auth-guard";
import { ROLE } from "helper/constants";

@Controller("manual-marking")
@ApiBearerAuth()
@ApiTags("Manual Marking")
export class ManualMarkingController {
    constructor(private readonly manualMarkingService: ManualMarkingLogService) {}

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Post("/create")
    async createManualMarking(@Body() createManualMarkingDto: CreateManualMarkingLogDto, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const manualMarking = await this.manualMarkingService.createManualMarkingLog(createManualMarkingDto);
            return commonResponse.success(languageCode, res, "MANUAL_MARKING_CREATED", 201, manualMarking);
        } catch (error) {
            console.error("manual-marking create error", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.PARENTS, ROLE.STUDENT)
    @Get("/list")
    @ApiQuery({ name: "sort", required: false, type: String, example: "asc", description: "Sort order (asc/desc)" })
    @ApiQuery({ name: "limit", required: false, type: Number, example: 10, description: "Limit the number of results" })
    @ApiQuery({ name: "page", required: false, type: Number, example: 1, description: "Page number for pagination" })
    async getManualMarkings(@Query() query: any, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const manualMarkings = await this.manualMarkingService.getManualMarkingLogs(query);
            if (manualMarkings) {
                return commonResponse.success(languageCode, res, "MANUAL_MARKINGS_FETCHED", 200, manualMarkings);
            } else {
                return commonResponse.error(languageCode, res, "NO_MANUAL_MARKINGS_FOUND", 404, {});
            }
        } catch (error) {
            console.error("manual-marking list error", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Get("/:id")
    async getManualMarkingById(@Param("id") id: number, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const manualMarking = await this.manualMarkingService.getManualMarkingLogById(id);
            if (manualMarking) {
                return commonResponse.success(languageCode, res, "MANUAL_MARKING_FETCHED", 200, manualMarking);
            } else {
                return commonResponse.error(languageCode, res, "NO_MANUAL_MARKINGS_FOUND", 404, {});
            }
        } catch (error) {
            console.error("manual-marking getById error", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Patch("patch/:id")
    async updateManualMarking(@Param("id") id: number, @Body() updateManualMarkingDto: UpdateManualMarkingLogDto, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const existingMarking = await this.manualMarkingService.getManualMarkingLogById(id);
            if (!existingMarking) {
                return commonResponse.error(languageCode, res, "MANUAL_MARKING_NOT_FOUND", 404, {});
            }

            const updatedMarking = await this.manualMarkingService.updateManualMarkingLog(id, updateManualMarkingDto);
            return commonResponse.success(languageCode, res, "MANUAL_MARKING_UPDATED", 200, updatedMarking);
        } catch (error) {
            console.error("manual-marking update error", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Delete("delete/:id")
    async deleteManualMarking(@Param("id") id: number, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const existingMarking = await this.manualMarkingService.getManualMarkingLogById(id);
            if (!existingMarking) {
                return commonResponse.error(languageCode, res, "MANUAL_MARKING_NOT_FOUND", 404, {});
            }
            await this.manualMarkingService.deleteManualMarkingLog(id);
            return commonResponse.success(languageCode, res, "MANUAL_MARKING_DELETED", 200, {});
        } catch (error) {
            console.error("manual-marking delete error", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }
}
