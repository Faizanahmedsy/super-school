import { Controller, Get, Post, Body, UseGuards, Req, UnauthorizedException, BadRequestException, NotFoundException, Res } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { Roles } from "src/decorator/role_decorator";
import { commonResponse } from "helper";
import { SchoolSetupService } from "./school-setup.service";
import { UpdateSetupDto } from "./dtos/setup-step.dto";
import { SetupStatusResponse } from "./responses/setup-status.response";
import { LANGUAGE_CODE, ROLE } from "helper/constants";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/role-auth-guard";

@Controller("school-setup")
@ApiBearerAuth()
@ApiTags("School Setup")
export class SchoolSetupController {
    constructor(private readonly schoolSetupService: SchoolSetupService) {}

    /*
     *  Create and Get Setup Status
     */
    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.SUB_ADMIN)
    @Get("status")
    @ApiOperation({
        summary: "Get setup status",
        description: "Retrieves the current school setup progress for the logged-in admin",
    })
    async getSetupStatus(@Req() req, @Res() res: Response): Promise<SetupStatusResponse> {
        const languageCode = req.headers["language_code"] || LANGUAGE_CODE.EN;
        try {
            console.log("🚀 ~ file: school-setup.controller.ts:33 ~ SchoolSetupController ~ getSetupStatus ~ req.user:", req.user);
            let data = await this.schoolSetupService.getOrCreateSetup(req.user.userId, req.user.institute_id);

            if (!data) {
                return commonResponse.success(languageCode, res, "DATA_NOT_FOUND", 200, {});
            }

            return commonResponse.success(languageCode, res, "SETUP_DATA_FETCHED", 200, data);
        } catch (error) {
            console.error("🚀 ~ file: school-setup.controller.ts:39 ~ SchoolSetupController ~ getSetupStatus ~ error:", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, error);
        }
    }

    /*
     *  Update Setup Status based on steps
     */
    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.SUB_ADMIN)
    @Post("update")
    @ApiOperation({
        summary: "Update setup step",
        description: "Updates the current setup step with provided data",
    })
    async updateSetup(@Req() req, @Body() updateSetupDto: UpdateSetupDto, @Res() res: Response): Promise<SetupStatusResponse> {
        const languageCode = req.headers["language_code"] || LANGUAGE_CODE.EN;

        try {
            let instituteId = req.user.institute_id;
            if (!updateSetupDto.step || !updateSetupDto.data) {
                throw new BadRequestException("Invalid request: Missing step or data");
            }
            console.log("🚀 ~ SchoolSetupController ~ updateSetup ~ updateSetupDto.data:", updateSetupDto.data);
            let stepData = await this.schoolSetupService.updateSetupStep(req.user.userId, updateSetupDto.step, updateSetupDto.data, instituteId);

            return commonResponse.success(languageCode, res, "SETUP_DATA_UPDATED", 200, stepData);
        } catch (error) {
            console.error("🚀 ~ file: school-setup.controller.ts:64 ~ SchoolSetupController ~ updateSetup ~ error:", error);
            if (error instanceof BadRequestException || error instanceof UnauthorizedException || error instanceof NotFoundException) {
                throw error; // Re-throw known exceptions
            }
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, error);
        }
    }
}
