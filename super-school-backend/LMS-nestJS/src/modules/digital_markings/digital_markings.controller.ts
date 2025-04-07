import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, Res, UseGuards } from "@nestjs/common";
import { DigitalMarkingService } from "./digital_markings.service";
import { CreateDigitalMarkingDto } from "./dtos/create-digital-markings.dto";
import { UpdateDigitalMarkingDto } from "./dtos/update-digital-markings.dto";
import { commonResponse } from "helper";
import { Request, Response } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/decorator/role_decorator";
import { RolesGuard } from "../auth/role-auth-guard";
import { ROLE } from "helper/constants";

@Controller("digital-marking")
@ApiBearerAuth()
@ApiTags("Digital Marking")
export class DigitalMarkingController {
    constructor(private readonly digitalMarkingService: DigitalMarkingService) {}

    // @UseGuards(JwtAuthGuard)
    // @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER)
    // @Post("/create")
    // async createDigitalMarking(@Body() createDigitalMarkingDto: CreateDigitalMarkingDto, @Req() req: Request, @Res() res: Response) {
    //     const languageCode = req.headers["language_code"];
    //     try {
    //         const digitalMarking = await this.digitalMarkingService.createDigitalMarking(createDigitalMarkingDto);
    //         return commonResponse.success(languageCode, res, "DIGITAL_MARKING_CREATED", 201, digitalMarking);
    //     } catch (error) {
    //         console.error("digital-marking create error", error);
    //         return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
    //     }
    // }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.PARENTS, ROLE.STUDENT)
    @Get("/list")
    @ApiQuery({ name: "sort", required: false, type: String, example: "asc", description: "Sort order (asc/desc)" })
    @ApiQuery({ name: "limit", required: false, type: Number, example: 10, description: "Limit the number of results" })
    @ApiQuery({ name: "page", required: false, type: Number, example: 1, description: "Page number for pagination" })
    async getDigitalMarkings(@Query() query: any, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const digitalMarkings = await this.digitalMarkingService.getDigitalMarkings(query);
            if (digitalMarkings) {
                return commonResponse.success(languageCode, res, "DIGITAL_MARKINGS_FETCHED", 200, digitalMarkings);
            } else {
                return commonResponse.error(languageCode, res, "NO_DIGITAL_MARKINGS_FOUND", 404, {});
            }
        } catch (error) {
            console.error("digital-marking list error", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Get("/:id")
    async getDigitalMarkingById(@Param("id") id: number, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const digitalMarking = await this.digitalMarkingService.getDigitalMarkingById(id);
            if (digitalMarking) {
                return commonResponse.success(languageCode, res, "DIGITAL_MARKING_FETCHED", 200, digitalMarking);
            } else {
                return commonResponse.error(languageCode, res, "DIGITAL_MARKING_NOT_FOUND", 404, {});
            }
        } catch (error) {
            console.error("digital-marking getById error", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Patch("patch/:id")
    async updateDigitalMarking(@Param("id") id: number, @Body() updateDigitalMarkingDto: UpdateDigitalMarkingDto, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const existingMarking = await this.digitalMarkingService.getDigitalMarkingById(id);
            if (!existingMarking) {
                return commonResponse.error(languageCode, res, "DIGITAL_MARKING_NOT_FOUND", 404, {});
            }

            const updatedMarking = await this.digitalMarkingService.updateDigitalMarking(id, updateDigitalMarkingDto);
            return commonResponse.success(languageCode, res, "DIGITAL_MARKING_UPDATED", 200, updatedMarking);
        } catch (error) {
            console.error("digital-marking update error", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Delete("delete/:id")
    async deleteDigitalMarking(@Param("id") id: number, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const existingMarking = await this.digitalMarkingService.getDigitalMarkingById(id);
            if (!existingMarking) {
                return commonResponse.error(languageCode, res, "DIGITAL_MARKING_NOT_FOUND", 404, {});
            }
            await this.digitalMarkingService.deleteDigitalMarking(id);
            return commonResponse.success(languageCode, res, "DIGITAL_MARKING_DELETED", 200, {});
        } catch (error) {
            console.error("digital-marking delete error", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }
}
