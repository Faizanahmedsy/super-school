// Import necessary modules and services
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Req,
    Res,
    Delete,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
} from "@nestjs/common";
import { UpdateStudyMaterialDto } from "./dtos/updateStudyMaterials.dto";
import { commonResponse } from "helper";
import { ApiBearerAuth, ApiTags, ApiParam, ApiQuery, ApiConsumes, ApiBody } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "src/decorator/role_decorator";
import { LANGUAGE_CODE, ROLE, STUDY_MATERIAL_TYPE } from "helper/constants";
import { SubjectService } from "../subject/subject.service";
import { AuditLogService } from "../audit_log/audit-log.service";
import { StudentService } from "../student/student.service";
import { CreateStudyMaterialDto } from "./dtos/createStudyMaterials.dto";
import { StudyMaterialService } from "./study_materials.service";
import { DivisionSubjectService } from "../division_subject/divisionsubject.service";
import { FileFieldsInterceptor, FileInterceptor } from "@nestjs/platform-express";
import { UploadService } from "../upload/upload.service";
import { OBSFileService } from "src/services/obs-file.service";
import { bufferToStream } from "helper/functions";

// Define the StudyMaterialController class
@Controller("study-material")
@ApiBearerAuth()
@ApiTags("Study Material")
export class StudyMaterialController {
    // Constructor for dependency injection
    constructor(
        private readonly studentService: StudentService,
        private studyMaterialServices: StudyMaterialService,
        private subjectService: SubjectService,
        private readonly auditLogService: AuditLogService,
        private readonly divisionSubjectService: DivisionSubjectService,
        private uploadService: UploadService,
        private obsService: OBSFileService
    ) {}

    // Method to create a new study material
    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Post("/create")
    // @UseInterceptors(FileInterceptor("file"), FileInterceptor("question_paper"), FileInterceptor("paper_memo"))
    @UseInterceptors(
        FileFieldsInterceptor([
            {
                name: "file",
            },
            {
                name: "question_paper",
            },
            {
                name: "paper_memo",
            },
        ])
    )
    @ApiConsumes("multipart/form-data")
    async createStudyMaterial(
        @UploadedFile()
        files: {
            file: Express.Multer.File;
            question_paper: Express.Multer.File;
            paper_memo: Express.Multer.File;
        },
        @Body() createStudyMaterialDto: CreateStudyMaterialDto,
        @Req() req,
        @Res() res
    ) {
        const languageCode = req.headers["language_code"] || LANGUAGE_CODE.EN;
        try {
            const { type, file, url } = createStudyMaterialDto;
            console.log("🚀 ~ file: study_materials.controller.ts:90 ~ StudyMaterialController ~ req.file:", req.files);

            // Conditional Validation Logic
            if (type === STUDY_MATERIAL_TYPE.BOOK || type === STUDY_MATERIAL_TYPE.DOCUMENTS) {
                if (!req.files.file && !url) {
                    throw new BadRequestException("Either file or URL is required for the selected type.");
                }
            } else if (type === STUDY_MATERIAL_TYPE.OLD_QUESTION_PAPER_AND_MEMO) {
                if (!req.files.question_paper || !req.files.paper_memo) {
                    throw new BadRequestException("Both question_paper and paper_memo are required for this type.");
                }
            } else {
                throw new BadRequestException("Invalid study material type.");
            }

            // Add created_by field to the createStudyMaterialDto object

            createStudyMaterialDto["created_by"] = req.user.userId;

            // Find the subject using the subject_id from the createStudyMaterialDto object
            let findSubject = await this.subjectService.getSubjectById(Number(createStudyMaterialDto.subject_id));

            if (findSubject) {
                // Add master_subject_id field to the createStudyMaterialDto object
                createStudyMaterialDto["master_subject_id"] = findSubject.master_subject_id;
            }
            if (req?.files?.file) {
                // const uploadFile = await this.uploadService.uploadStudyMaterial(req.files.file[0]);
                const directoryPath = "uploads/study-material";

                const objectKey = `${directoryPath}/${Date.now()}-${req.files.file[0].originalname}`;

                const fileStream = bufferToStream(req.files.file[0].buffer);

                await this.obsService.uploadObject(objectKey, fileStream, req.files.file[0].mimetype);
                createStudyMaterialDto.file = objectKey;
            }

            if (req?.files?.question_paper) {
                const directoryPath = "uploads/study-material";

                const objectKey = `${directoryPath}/${Date.now()}-${req.files.question_paper[0].originalname}`;

                const fileStream = bufferToStream(req.files.question_paper[0].buffer);

                await this.obsService.uploadObject(objectKey, fileStream, req.files.question_paper[0].mimetype);
                // const uploadFile = await this.uploadService.uploadStudyMaterial(req.files.question_paper[0]);
                createStudyMaterialDto.question_paper = objectKey;
            }

            if (req?.files?.paper_memo) {
                const directoryPath = "uploads/study-material";

                const objectKey = `${directoryPath}/${Date.now()}-${req.files.paper_memo[0].originalname}`;

                const fileStream = bufferToStream(req.files.paper_memo[0].buffer);

                await this.obsService.uploadObject(objectKey, fileStream, req.files.paper_memo[0].mimetype);
                // const uploadFile = await this.uploadService.uploadStudyMaterial(req.files.paper_memo[0]);
                createStudyMaterialDto.paper_memo = objectKey;
            }

            // Create a new study material using the create method from the StudyMaterialService
            console.log(createStudyMaterialDto, "-------------------");
            const createdStudyMaterial = await this.studyMaterialServices.create(createStudyMaterialDto);

            // Create an audit log for the created study material
            await this.auditLogService.create({
                action: "CREATE",
                message: `Study Material added for ${createdStudyMaterial.grade_id}.`,
                old_data: null,
                new_data: createdStudyMaterial,
                action_user_id: req.user.userId,
                role_id: req.user.role_id,
            });

            // If the study material is created successfully, map the students to the study material
            if (createdStudyMaterial && type === STUDY_MATERIAL_TYPE.BOOK) {
                return commonResponse.success(languageCode, res, "TEXTBOOK_GUIDES_CREATED", 200, createdStudyMaterial);
            } else if (createdStudyMaterial && type === STUDY_MATERIAL_TYPE.OLD_QUESTION_PAPER_AND_MEMO) {
                return commonResponse.success(languageCode, res, "OLD_QUESTION_PAPER_AND_MEMO_CREATED", 200, createdStudyMaterial);
            } else {
                return commonResponse.success(languageCode, res, "DOCUMENTS_CREATED", 200, createdStudyMaterial);
            }

            // Return a success response with the created study material
        } catch (error) {
            console.log("🚀 ~ file: study_materials.controller.ts:110 ~ StudyMaterialController ~ error:", error);
            return commonResponse.error(languageCode, res, "SERVER_ERROR", 500, {});
        }
    }

    /**
     * Retrieve a list of study material with optional filtering and pagination
     *
     * This endpoint allows fetching a list of study material with various query parameters
     * for filtering and pagination. It's accessible to Master Admin, Sub Admin, Teacher,
     * and Department of Education roles.
     *
     * @param req - The request object
     * @param res - The response object
     * @param query - Query parameters for filtering and pagination
     * @returns A list of study material matching the query criteria
     */
    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION, ROLE.STUDENT)
    @Get("/list")
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
    @ApiQuery({ name: "school_id", required: false, type: Number, example: 1, description: "Filter by school_id" })
    @ApiQuery({ name: "grade_id", required: false, type: Number, example: 8, description: "Filter by grade_id" })
    @ApiQuery({ name: "master_subject_id", required: false, type: Number, example: 1, description: "Filter by master_subject_id" })
    @ApiQuery({ name: "subject_id", required: false, type: Number, example: 1, description: "Filter by subject_id" })
    @ApiQuery({ name: "teacher_id", required: false, type: Number, example: 1, description: "Filter by teacher_id" })
    @ApiQuery({ name: "term_id", required: false, type: Number, example: 1, description: "Filter by term_id" })
    @ApiQuery({ name: "batch_id", required: false, type: Number, example: 1, description: "Filter by batch_id" })
    @ApiQuery({ name: "search", required: false, type: String, example: "search text", description: "Filter by search" })
    @ApiQuery({ name: "year", required: false, type: String, example: "year ", description: "Filter by year in question paper and memo" })
    @ApiQuery({
        name: "type",
        required: true,
        type: String,
        enum: STUDY_MATERIAL_TYPE,
    })
    async studyMaterialList(@Req() req, @Res() res, @Query() query: any) {
        const languageCode = req.headers["language_code"];
        try {
            if (req.user.role_name == ROLE.STUDENT) {
                let studentData = await this.studentService.isExist({ student_user_id: req.user.userId });
                if (!studentData) {
                    return commonResponse.error(languageCode, res, "TEACHER_NOT_FOUND", 400, {});
                } else {
                    // Find related DivisionSubject details
                    const divisionSubjects = await this.divisionSubjectService.findByStudentId(studentData.id);

                    if (divisionSubjects) {
                        query.grade_id = query?.grade_id;
                        query.grade_class_id = query?.grade_class_id;
                        query.subject_id = query?.subject_id;
                        query.master_subject_id = query?.master_subject_id;
                        query.term_id = query?.term_id;
                        query.batch_id = query?.batch_id;
                    }
                }
            }
            console.log("🚀 ~ file: study_materials.controller.ts:180 ~ StudyMaterialController ~ studyMaterialList ~ query:", query);
            const studyMaterial = await this.studyMaterialServices.findAll(query);

            if (studyMaterial.list.length > 0) {
                const expiresIn = parseInt(process.env.SIGNATURE_EXPIRY); // Link valid for 1 hour
                for (let data of studyMaterial.list) {
                    if (data.file) {
                        data.file = await this.obsService.getObject(data.file, expiresIn);
                    }
                    if (data.question_paper) {
                        data.question_paper = await this.obsService.getObject(data.question_paper, expiresIn);
                    }
                    if (data.paper_memo) {
                        data.paper_memo = await this.obsService.getObject(data.paper_memo, expiresIn);
                    }
                }
            }
            if (query.type === STUDY_MATERIAL_TYPE.BOOK) {
                return commonResponse.success(languageCode, res, "TEXTBOOK_GUIDES_LIST", 200, studyMaterial);
            } else if (query.type === STUDY_MATERIAL_TYPE.OLD_QUESTION_PAPER_AND_MEMO) {
                return commonResponse.success(languageCode, res, "OLD_QUESTION_PAPER_AND_MEMO_LIST", 200, studyMaterial);
            } else {
                return commonResponse.success(languageCode, res, "DOCUMENTS_LIST", 200, studyMaterial);
            }
        } catch (error) {
            console.log("🚀 ~ file: study_materials.controller.ts:243 ~ StudyMaterialController ~ studyMaterialList ~ error:", error);
            return commonResponse.error(languageCode, res, "SERVER_ERROR", 500, {});
        }
    }

    /*
     *  Endpoint to retrieve a specific study material by ID
     */
    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Get(":id")
    @ApiParam({
        name: "id",
        required: true,
        type: Number,
        description: "study material Id",
    })
    async getStudyMaterialById(@Param("id") id: number, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            const studyMaterialData = await this.studyMaterialServices.findById(id);
            const expiresIn = parseInt(process.env.SIGNATURE_EXPIRY); // Link valid for 1 hour

            if (studyMaterialData.file) {
                studyMaterialData.file = await this.obsService.getObject(studyMaterialData.file, expiresIn);
            }
            if (studyMaterialData.question_paper) {
                studyMaterialData.question_paper = await this.obsService.getObject(studyMaterialData.question_paper, expiresIn);
            }
            if (studyMaterialData.paper_memo) {
                studyMaterialData.paper_memo = await this.obsService.getObject(studyMaterialData.paper_memo, expiresIn);
            }

            if (studyMaterialData.type === STUDY_MATERIAL_TYPE.BOOK) {
                return commonResponse.success(languageCode, res, "TEXTBOOK_GUIDES_DETAILS", 200, studyMaterialData);
            } else if (studyMaterialData.type === STUDY_MATERIAL_TYPE.OLD_QUESTION_PAPER_AND_MEMO) {
                return commonResponse.success(languageCode, res, "OLD_QUESTION_PAPER_AND_MEMO_DETAILS", 200, studyMaterialData);
            } else {
                return commonResponse.success(languageCode, res, "DOCUMENTS_DETAILS", 200, studyMaterialData);
            }
        } catch (error) {
            console.log("🚀 ~ file: study_materials.controller.ts:272 ~ StudyMaterialController ~ getStudyMaterialById ~ error:", error);
            return commonResponse.error(languageCode, res, "SERVER_ERROR", 500, {});
        }
    }

    /*
     *   Update Study Material
     */
    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Patch("patch/:id")
    @UseInterceptors(
        FileFieldsInterceptor([
            {
                name: "file",
            },
            {
                name: "question_paper",
            },
            {
                name: "paper_memo",
            },
        ])
    )
    @ApiConsumes("multipart/form-data")
    @ApiParam({
        name: "id",
        required: true,
        type: Number,
        description: "Study Material Id",
    })
    async updateStudyMaterial(@Param("id") id: number, @Body() updateStudyMaterialDto: UpdateStudyMaterialDto, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            const checkExist = await this.studyMaterialServices.isExist(id);
            if (!checkExist) {
                return commonResponse.error(languageCode, res, "STUDY_MATERIAL_NOT_FOUND", 400, {});
            }

            // if (req?.files?.file) {
            //     const uploadFile = await this.uploadService.uploadStudyMaterial(req.files.file[0]);
            //     updateStudyMaterialDto.file = uploadFile;
            // }
            // if (req?.files?.question_paper) {
            //     const uploadFile = await this.uploadService.uploadStudyMaterial(req.files.question_paper[0]);
            //     updateStudyMaterialDto.question_paper = uploadFile;
            // }
            // if (req?.files?.paper_memo) {
            //     const uploadFile = await this.uploadService.uploadStudyMaterial(req.files.paper_memo[0]);
            //     updateStudyMaterialDto.paper_memo = uploadFile;
            // }

            if (req?.files?.file) {
                // const uploadFile = await this.uploadService.uploadStudyMaterial(req.files.file[0]);
                const directoryPath = "uploads/study-material";

                const objectKey = `${directoryPath}/${Date.now()}-${req.files.file[0].originalname}`;

                const fileStream = bufferToStream(req.files.file[0].buffer);

                await this.obsService.uploadObject(objectKey, fileStream, req.files.file[0].mimetype);
                updateStudyMaterialDto.file = objectKey;
            }

            if (req?.files?.question_paper) {
                const directoryPath = "uploads/study-material";

                const objectKey = `${directoryPath}/${Date.now()}-${req.files.question_paper[0].originalname}`;

                const fileStream = bufferToStream(req.files.question_paper[0].buffer);

                await this.obsService.uploadObject(objectKey, fileStream, req.files.question_paper[0].mimetype);
                // const uploadFile = await this.uploadService.uploadStudyMaterial(req.files.question_paper[0]);
                updateStudyMaterialDto.question_paper = objectKey;
            }

            if (req?.files?.paper_memo) {
                const directoryPath = "uploads/study-material";

                const objectKey = `${directoryPath}/${Date.now()}-${req.files.paper_memo[0].originalname}`;

                const fileStream = bufferToStream(req.files.paper_memo[0].buffer);

                await this.obsService.uploadObject(objectKey, fileStream, req.files.paper_memo[0].mimetype);
                // const uploadFile = await this.uploadService.uploadStudyMaterial(req.files.paper_memo[0]);
                updateStudyMaterialDto.paper_memo = objectKey;
            }

            const oldGrade = JSON.parse(JSON.stringify(checkExist));
            const updatedStudyMaterial = await this.studyMaterialServices.update(id, updateStudyMaterialDto);

            if (updatedStudyMaterial) {
                await this.auditLogService.create({
                    action: "UPDATE",
                    message: `Study Material updated for ${updatedStudyMaterial.grade_id}.`,
                    old_data: oldGrade,
                    new_data: updatedStudyMaterial,
                    action_user_id: req.user.userId,
                    role_id: req.user.role_id,
                });

                return commonResponse.success(languageCode, res, "STUDY_MATERIAL_UPDATED", 200, updatedStudyMaterial);
            }
        } catch (error) {
            console.log("🚀 ~ file: study_materials.controller.ts:266 ~ StudyMaterialController ~ updateLessonPlan ~ error:", error);
            return commonResponse.error(languageCode, res, "SERVER_ERROR", 500, {});
        }
    }

    /*
     *   Delete Study Materials by id
     */
    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Delete("delete/:id")
    @ApiParam({
        name: "id",
        required: true,
        type: Number,
        description: "Study Material Id",
    })
    async deleteStudyMaterial(@Param("id") id: number, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            let checkExist = await this.studyMaterialServices.isExist(id);

            if (!checkExist) {
                return commonResponse.error(languageCode, res, "STUDY_MATERIAL_NOT_FOUND", 404, {});
            }

            console.log("checkExistcheckExistcheckExist", checkExist);

            const oldData = checkExist ? JSON.parse(JSON.stringify(checkExist)) : {};

            await this.studyMaterialServices.delete(id);

            const deletedAt = new Date();
            const auditLogData = {
                action: "DELETE",
                message: `Study Material deleted against ${checkExist.grade_id}.`,
                old_data: oldData,
                new_data: null,
                action_user_id: req.user.userId,
                role_id: req.user.role_id,
            };
            await this.auditLogService.create(auditLogData);
            return commonResponse.success(languageCode, res, "STUDY_MATERIAL_DELETED", 200, {});
        } catch (error) {
            console.log("🚀 ~ file: study_materials.controller.ts:311 ~ StudyMaterialController ~ deleteStudyMaterial ~ error:", error);
            return commonResponse.error(languageCode, res, "SERVER_ERROR", 500, {});
        }
    }
}
