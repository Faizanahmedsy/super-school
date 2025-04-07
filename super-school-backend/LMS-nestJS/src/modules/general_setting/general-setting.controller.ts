import { Controller, Post, Body, Req, Res, UseGuards, Logger, UseInterceptors, UploadedFile, Put, Get, Delete } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/role-auth-guard";
import { ROLE } from "helper/constants";
import { commonResponse } from "helper";
import { Request, Response } from "express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { GeneralSettingService } from "./general-setting.service";
import { GeneralSettingDto } from "./dtos/create-general-settinf.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadService } from "../upload/upload.service";
import { string } from "joi";
import { Roles } from "src/decorator/role_decorator";
import { RemoveLogoDto } from "./dtos/remove-logo.dto";
interface GeneralSetting {
    theme_primary_color?: string;
    theme_secondary_color?: string;
    support_email?: string;
    logo?: string;
}
interface SchoolData {
    themePrimaryColor?: string;
    themeSecondaryColor?: string;
    support_email?: string;
    logo?: string;
}
@ApiBearerAuth()
@ApiTags("General Settings")
@Controller("general-setting")
export class GeneralSettingController {
    private readonly logger = new Logger(GeneralSettingController.name);

    constructor(private readonly generalSettingService: GeneralSettingService, private uploadService: UploadService) {}

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN)
    @Post("/updated")
    @ApiBody({ type: GeneralSettingDto })
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        description: "Admin profile photo and details",
        schema: {
            type: "object",
            properties: {
                logo: { type: "string", format: "binary" },
                theme_primary_color: { type: "string" },
                theme_secondary_color: { type: "string" },
                support_email: { type: "string" },
            },
        },
    })
    @UseInterceptors(FileInterceptor("logo"))
    async updateThemeColor(@Req() req: Request, @Res() res: Response, @Body() body: GeneralSettingDto, @UploadedFile() logo: Express.Multer.File) {
        const languageCode = req.headers["language_code"];
        const userRole = req.user.role_name;
        console.log("🚀 ~ GeneralSettingController ~ updateThemeColor ~ userRole:", userRole);

        let logoFilePath = null;

        try {
            let updateSchool: SchoolData = {};
            let generalSetting: GeneralSetting = {};
            if (body?.theme_primary_color) {
                updateSchool.themePrimaryColor = body.theme_primary_color;
                generalSetting.theme_primary_color = body.theme_primary_color;
            }
            if (body?.theme_secondary_color) {
                updateSchool.themeSecondaryColor = body.theme_secondary_color;
                generalSetting.theme_secondary_color = body.theme_secondary_color;
            }

            if (body?.support_email) {
                generalSetting.support_email = body.support_email;
            }
            if (logo) {
                if (userRole === ROLE.SUB_ADMIN) {
                    this.logger.log(`Admin updating logo for institute ID ${req.user.institute_id}.`);

                    const existingLogoPath = await this.generalSettingService.getLogoPathForInstitute(req.user.institute_id);

                    if (existingLogoPath) {
                        await this.uploadService.removeLogo(existingLogoPath);
                    }
                    logoFilePath = await this.uploadService.uploadLogo(logo);
                }
            }

            if (userRole === ROLE.MASTER_ADMIN) {
                let isExistGeneralSetting = await this.generalSettingService.updateRecord(generalSetting);
                if (!isExistGeneralSetting) {
                    return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
                }

                return commonResponse.error(languageCode, res, "GENERAL_SETTING_UPDATED", 200, isExistGeneralSetting);
            }

            if (userRole === ROLE.SUB_ADMIN) {
                updateSchool.logo = logoFilePath;
                let updated = await this.generalSettingService.updateInstituteData(req.user.institute_id, updateSchool);
                if (!updated) {
                    return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
                }
                let response = {
                    theme_primary_color: updateSchool.themePrimaryColor,
                    theme_secondary_color: updateSchool.themeSecondaryColor,
                    logo: updateSchool.logo,
                };
                return commonResponse.error(languageCode, res, "GENERAL_SETTING_UPDATED", 200, response);
            }
        } catch (error) {
            this.logger.error("Error updating theme color", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN)
    @Get("/general-setting")
    async getGeneralSetting(@Req() req: any, @Res() res: any) {
        const languageCode = req.headers["language_code"];
        try {
            let generalSetting: GeneralSetting = {};
            if (req.user.role_name == ROLE.SUB_ADMIN) {
                let institute = await this.generalSettingService.getInstitute(req.user.institute_id);
                if (!institute) {
                    return commonResponse.success(languageCode, res, "DATA_NOT_FOUND", 200, {});
                }
                let response = {
                    theme_primary_color: institute.themePrimaryColor,
                    theme_secondary_color: institute.themeSecondaryColor,
                    logo: institute.logo,
                };
                return commonResponse.error(languageCode, res, "GET_SETTING_DETAIL", 200, response);
            }

            let getSetting = await this.generalSettingService.getSetting();
            if (!getSetting) {
                return commonResponse.success(languageCode, res, "DATA_NOT_FOUND", 200, {});
            }
            return commonResponse.error(languageCode, res, "GET_SETTING_DETAIL", 200, getSetting);
        } catch (error) {
            console.log("🚀 ~ GeneralSettingController ~ getGeneralSetting ~ error:", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN)
    @Delete("/remove-logo")
    @ApiBody({
        description: "School id must required",
        schema: {
            type: "object",
            properties: {
                school_id: { type: "number" },
            },
        },
    })
    async removeLogo(@Body() body: RemoveLogoDto, @Req() req: any, @Res() res: any) {
        const languageCode = req.headers["language_code"];
        try {
            let instituteExist = await this.generalSettingService.getInstitute(body.school_id);

            if (instituteExist?.logo == null) {
                return commonResponse.success(languageCode, res, "LOGO_UPDATED", 200, {});
            }
            if (instituteExist?.logo) {
                await this.uploadService.removeLogo(instituteExist?.logo);
            }
            let payload = {
                logo: null,
            };
            let updated = await this.generalSettingService.updateInstituteLogo(body.school_id, payload);
            if (!updated) {
                return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
            }
            return commonResponse.success(languageCode, res, "LOGO_UPDATED", 200, {});
        } catch (error) {
            console.log("🚀 ~ GeneralSettingController ~ removeLogo ~ error:", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }
}
