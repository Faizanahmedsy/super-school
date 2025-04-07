import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Res, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { SupportService } from "./support.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/role-auth-guard";
import { Roles } from "src/decorator/role_decorator";
import { ROLE } from "helper/constants";
import { AddSupport } from "./dto/add-support.dto";
import { commonResponse } from "helper";
import { AnyFilesInterceptor, FileFieldsInterceptor, FileInterceptor } from "@nestjs/platform-express";
import { UploadService } from "../upload/upload.service";
import { UsersService } from "../users/user.service";
import { InstituteService } from "../institutes/institutes.service";
import { UpdateSupport } from "./dto/update-support.dto";
import { bufferToStream } from "helper/functions";
import { OBSFileService } from "src/services/obs-file.service";

@Controller("support")
@ApiBearerAuth()
@ApiTags("Support")
export class SupportController {
    constructor(
        private readonly supportService: SupportService,
        private uploadService: UploadService,
        private userService: UsersService,
        private instituteService: InstituteService,
        private obsService: OBSFileService
    ) {}

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.STUDENT, ROLE.DEPARTMENT_OF_EDUCTION)
    @UseInterceptors(
        FileFieldsInterceptor([
            {
                name: "attachment",
            },
        ])
    )
    @Post("/add-report")
    async addReport(
        @Body() body: AddSupport,
        @UploadedFile()
        files: {
            attachment?: Express.Multer.File[];
        },
        @Req() req: any,
        @Res() res: any
    ) {
        const languageCode = req.headers["language_code"];
        try {
            let images: string[] = [];
            console.log(req.files);
            if (req?.files?.attachment?.length) {
                for (let i = 0; i < req?.files?.attachment?.length; i++) {
                    if (req?.files?.attachment) {
                        // let image = await this.uploadService.uploadDynamicFiles("support", req?.files?.attachment[i]);
                        // images.push(image);

                        const directoryPath = "uploads/support";

                        const objectKey = `${directoryPath}/${Date.now()}-${req?.files?.attachment[i].originalname}`;

                        const fileStream = bufferToStream(req?.files?.attachment[i].buffer);

                        await this.obsService.uploadObject(objectKey, fileStream, req?.files?.attachment[i].mimetype);
                        images.push(objectKey);
                    }
                }
            }
            body.attachment = images;
            body["user_id"] = req.user.userId;

            if (req?.user?.institute_id) {
                body["school_id"] = req.user.institute_id;
            } else {
                if (!body.school_id) {
                    return commonResponse.error(languageCode, res, "SCHOOL_REQUIRED", 409, {});
                }
            }

            let school = await this.instituteService.findById(req.user.institute_id);

            let user = await this.userService.getUserById(req.user.userId);
            if (!user) {
                return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
            }
            body["email"] = user.email;

            let attachment = await this.supportService.addAttachment(body);
            if (!attachment) {
                return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
            }

            let imagesArray: string[] = attachment.attachment;

            imagesArray = imagesArray.map((data) => process.env.API_SERVER_PATH + "/" + data);
            attachment.attachment = imagesArray;

            attachment["school_name"] = school.school_name;
            console.log("🚀 ~ SupportController ~ attachment:", attachment);

            this.supportService.sendSupportRequestEmail(attachment);
            return commonResponse.success(languageCode, res, "REQUEST_ADDED", 201, attachment);
        } catch (error) {
            console.log("🚀 ~ ReportController ~ addReport ~ error:", error);
            return commonResponse.error(languageCode, res, "INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.STUDENT)
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
    @ApiQuery({ name: "sort", required: false, type: String, example: "asc", description: "Sort order (asc/desc)" })
    @ApiQuery({ name: "school_id", required: false, type: Number, example: 1, description: "Filter by school_id" })
    @ApiQuery({ name: "search", required: false, type: String, example: "Name", description: "Search by name" })
    async getList(@Req() req: any, @Res() res: any, @Query() query: any) {
        const languageCode = req.headers["language_code"];
        try {
            let supportData = await this.supportService.getList(query);
            if (!supportData) {
                return commonResponse.error(languageCode, res, "DATA_NOT_FOUND", 200, {});
            }
            return commonResponse.success(languageCode, res, "SUPPORT_LIST", 200, supportData);
        } catch (error) {
            console.log("🚀 ~ TimeTableController ~ getList ~ error:", error);
            return commonResponse.error(languageCode, res, "INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.STUDENT)
    @Get(":id")
    async getDetail(@Param("id") id: number, @Req() req: any, @Res() res: any) {
        const languageCode = req.headers["language_code"];
        try {
            let isExist = await this.supportService.detail({ id: id });

            if (!isExist) {
                return commonResponse.error(languageCode, res, "DATA_NOT_FOUND", 400, {});
            }

            if (isExist?.attachment?.length) {
                let expiresIn = parseInt(process.env.SIGNATURE_EXPIRY);
                isExist.attachment = await Promise.all(isExist.attachment.map(async (data) => await this.obsService.getObject(data, expiresIn)));
            }

            return commonResponse.success(languageCode, res, "REQUEST_DETAIL", 200, isExist);
        } catch (error) {
            console.log("🚀 ~ SupportController ~ getDetail ~ error:", error);
            return commonResponse.error(languageCode, res, "INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN)
    @Delete("delete/:id")
    async deleteASupportRequest(@Param("id") id: number, @Req() req: any, @Res() res: any) {
        const languageCode = req.headers["language_code"];
        try {
            let isExist = await this.supportService.isExist({ id: id });
            if (!isExist) {
                return commonResponse.error(languageCode, res, "DATA_NOT_FOUND", 400, {});
            }
            const deleted = await this.supportService.deleteEvent(isExist);
            if (!deleted) {
                return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
            }
            return commonResponse.success(languageCode, res, "REQUEST_DELETED", 200, {});
        } catch (error) {
            console.log("🚀 ~ SupportController ~ deleteTimeTable ~ error:", error);
            return commonResponse.error(languageCode, res, "INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    // @UseGuards(JwtAuthGuard)
    // @Roles(ROLE.MASTER_ADMIN)
    // @UseInterceptors(AnyFilesInterceptor())
    // @Put("update/:id")
    // async UpdateSupport(
    //     @Param("id") id: number,
    //     @Body() body: UpdateSupport,
    //     @UploadedFiles() files: { [key: string]: Express.Multer.File[] },
    //     @Req() req: any,
    //     @Res() res: any
    // ) {
    //     const languageCode = req.headers["language_code"];
    //     try {
    //         let isExist = await this.supportService.isExist({ id: id });
    //         if (!isExist) {
    //             return commonResponse.error(languageCode, res, "DATA_NOT_FOUND", 400, {});
    //         }

    //         const files = req.files as Express.Multer.File[];
    //         let existAttachment = isExist?.attachment || []; // Ensure it's always an array

    //         for (const file of files) {
    //             let fieldName = file.fieldname;
    //             const dataMatch = fieldName.match(/([^.\[]+)\[([^\]]+)\]$/); // Extract index
    //             const index = dataMatch[2];
    //             const key = dataMatch[1];

    //             if (key == "attachment") {
    //                 let newFile = await this.uploadService.uploadDynamicFiles("support", file);

    //                 if (index !== undefined && Number(index) < existAttachment.length) {
    //                     // Replace existing index
    //                     existAttachment[Number(index)] = newFile;
    //                 } else {
    //                     // Append to the last position
    //                     existAttachment.push(newFile);
    //                 }
    //             }
    //         }

    //         // Update in DB
    //         delete body.attachment;
    //         isExist.attachment = existAttachment;
    //         let updateData = await this.supportService.updateData(isExist);

    //         if (!updateData) {
    //             return commonResponse.error(languageCode, res, "DATA_NOT_FOUND", 400, {});
    //         }

    //         return commonResponse.success(languageCode, res, "REQUEST_UPDATED", 200, updateData);
    //     } catch (error) {
    //         console.log("🚀 ~ SupportController ~ UpdateSupport ~ error:", error);
    //         return commonResponse.error(languageCode, res, "INTERNAL_SERVER_ERROR", 500, {});
    //     }
    // }
}
