import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, Res, UseGuards } from "@nestjs/common";
import { StudentAnswerSheetService } from "./student_answer_sheet.service";
import { CreateStudentAnswerSheetDto } from "./dtos/create-student-answer-sheet.dto";
import { UpdateStudentAnswerSheetDto } from "./dtos/updtae-student-answer-sheet.dto";
import { commonResponse } from "helper";
import { Request, Response } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/decorator/role_decorator";
import { RolesGuard } from "../auth/role-auth-guard";
import { ROLE } from "helper/constants";

@Controller("student-answersheet")
@ApiBearerAuth()
@ApiTags("Student Answer Sheet")
export class StudentAnswerSheetController {
    constructor(private readonly studentAnswerSheetService: StudentAnswerSheetService) {}

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Post("/create")
    async createStudentAnswerSheet(@Body() createStudentAnswerSheetDto: CreateStudentAnswerSheetDto, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const studentAnswerSheet = await this.studentAnswerSheetService.createStudentAnswerSheet(createStudentAnswerSheetDto);
            return commonResponse.success(languageCode, res, "STUDENT_ANSWER_SHEET_CREATED", 201, studentAnswerSheet);
        } catch (error) {
            console.log("student-answersheet create", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.PARENTS, ROLE.STUDENT)
    @Get("/list")
    @ApiQuery({ name: "sort", required: false, type: String, example: "asc", description: "Sort order (asc/desc)" })
    @ApiQuery({ name: "limit", required: false, type: Number, example: 10, description: "Limit the number of results" })
    @ApiQuery({ name: "page", required: false, type: Number, example: 1, description: "Page number for pagination" })
    async getStudentAnswerSheets(@Query() query: any, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const studentAnswerSheets = await this.studentAnswerSheetService.getStudentAnswerSheets(query);
            if (studentAnswerSheets) {
                return commonResponse.success(languageCode, res, "STUDENT_ANSWER_SHEETS_FETCHED", 200, studentAnswerSheets);
            } else {
                return commonResponse.error(languageCode, res, "NO_STUDENT_ANSWER_SHEETS_FOUND", 404, {});
            }
        } catch (error) {
            console.log("student-answersheet list", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Get("/:id")
    async getStudentAnswerSheetById(@Param("id") id: number, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const studentAnswerSheet = await this.studentAnswerSheetService.getStudentAnswerSheetById(id);
            if (studentAnswerSheet) {
                return commonResponse.success(languageCode, res, "STUDENT_ANSWER_SHEET_FETCHED", 200, studentAnswerSheet);
            } else {
                return commonResponse.error(languageCode, res, "NO_STUDENT_ANSWER_SHEETS_FOUND", 404, {});
            }
        } catch (error) {
            console.log("student-answersheet list id", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Patch("patch/:id")
    async updateStudentAnswerSheet(
        @Param("id") id: number,
        @Body() updateStudentAnswerSheetDto: UpdateStudentAnswerSheetDto,
        @Req() req: Request,
        @Res() res: Response
    ) {
        const languageCode = req.headers["language_code"];
        try {
            const checkExist = await this.studentAnswerSheetService.getStudentAnswerSheetById(id);
            if (!checkExist) {
                return commonResponse.error(languageCode, res, "STUDENT_ANSWER_SHEET_NOT_FOUND", 404, {});
            }

            const updatedStudentAnswerSheet = await this.studentAnswerSheetService.updateStudentAnswerSheet(id, updateStudentAnswerSheetDto);
            return commonResponse.success(languageCode, res, "STUDENT_ANSWER_SHEET_UPDATED", 200, updatedStudentAnswerSheet);
        } catch (error) {
            console.log("student-answersheet update", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Delete("delete/:id")
    async deleteStudentAnswerSheet(@Param("id") id: number, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const checkExist = await this.studentAnswerSheetService.getStudentAnswerSheetById(id);
            if (!checkExist) {
                return commonResponse.error(languageCode, res, "STUDENT_ANSWER_SHEET_NOT_FOUND", 404, {});
            }
            await this.studentAnswerSheetService.deleteStudentAnswerSheet(id);
            return commonResponse.success(languageCode, res, "STUDENT_ANSWER_SHEET_DELETED", 200, {});
        } catch (error) {
            console.log("student-answersheet delete", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }
}
