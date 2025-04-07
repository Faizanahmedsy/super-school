import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Req,
    Res,
    UseGuards,
    UseInterceptors,
    BadRequestException,
    InternalServerErrorException,
    Query,
} from "@nestjs/common";
import { UsersService } from "./user.service";
import { Request, Response } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/decorator/role_decorator";
import { RolesGuard } from "../auth/role-auth-guard";
import { ROLE } from "helper/constants";
import { commonResponse } from "helper";
import { CreateUserDto } from "../users/dtos/create-users.dto";
import { UpdateUserDto } from "../users/dtos/update-users.dto";
import { commonFunctions } from "helper";
// import { S3Service } from "src/services/s3.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadedFile } from "@nestjs/common";
import { User } from "./user.entity";
import { UploadService } from "../upload/upload.service";
import * as bcrypt from "bcrypt";
import { OBSFileService } from "../../services/obs-file.service";

@Controller("users")
@ApiBearerAuth()
@ApiTags("Users")
export class UsersController {
    constructor(
        private readonly usersService: UsersService, // private readonly s3Service: S3Service,
        private readonly uploadService: UploadService
    ) {}

    @Post("/create")
    async createUser(@Body() createUserDto: CreateUserDto, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"] || "en";
        try {
            const checkExist = await this.usersService.isExist({ email: createUserDto.email });
            if (checkExist) {
                return commonResponse.error(languageCode, res, "USER_EXIST", 409, {});
            }

            const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
            const userCreated = await this.usersService.createUser({
                ...createUserDto,
                password: hashedPassword,
            });

            if (userCreated) {
                return commonResponse.success(languageCode, res, "USER_CREATED_SUCCESS", 201, userCreated);
            } else {
                return commonResponse.error(languageCode, res, "DEFAULTER", 400, {});
            }
        } catch (error) {
            console.error("Error creating user:", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, { message: error.message });
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Get("/list")
    @ApiQuery({ name: "sort", required: false, type: String, example: "asc", description: "Sort order (asc/desc)" })
    @ApiQuery({ name: "limit", required: false, type: Number, example: 10, description: "Limit the number of results" })
    @ApiQuery({ name: "page", required: false, type: Number, example: 1, description: "Page number for pagination" })
    @ApiQuery({ name: "role_id", required: false, type: Number, example: 1, description: "Filter users by role ID" })
    async getAllUsers(@Req() req: Request, @Res() res: Response, @Query("sort") sort?: "asc" | "desc") {
        const languageCode = req.headers["language_code"];
        try {
            const validSort = sort === "desc" ? "desc" : "asc";
            const users = await this.usersService.getUsers(validSort);
            if (users && users.length > 0) {
                return commonResponse.success(languageCode, res, "USERS_LIST_SUCCESS", 200, users);
            } else {
                return commonResponse.error(languageCode, res, "NO_USERS_FOUND", 404, {});
            }
        } catch (error) {
            console.error("Error during user list:", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Get(":id")
    async getUserById(@Param("id") id: number, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const user = await this.usersService.findById(id);
            if (user) {
                return commonResponse.success(languageCode, res, "USER_DETAILS", 200, user);
            } else {
                return commonResponse.error(languageCode, res, "NO_USERS_FOUND", 404, {});
            }
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Patch("patch/:id")
    async updateUser(@Param("id") id: number, @Body() updateUserDto: UpdateUserDto, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const user = await this.usersService.findById(id);
            if (user) {
                Object.assign(user, updateUserDto);
                const updatedUser = await this.usersService.update(user);
                return commonResponse.success(languageCode, res, "USER_UPDATED_SUCCESS", 200, updatedUser);
            } else {
                return commonResponse.error(languageCode, res, "NO_USERS_FOUND", 404, {});
            }
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Delete("delete/:id")
    async deactivateUser(@Param("id") id: number, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const updatedUser = await this.usersService.deactivateUser(id);

            if (!updatedUser) {
                return commonResponse.error(languageCode, res, "NO_USERS_FOUND", 404, {});
            }

            return commonResponse.success(languageCode, res, "USER_DELETED_SUCCESS", 200, updatedUser);
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, { message: error.message });
        }
    }
}
