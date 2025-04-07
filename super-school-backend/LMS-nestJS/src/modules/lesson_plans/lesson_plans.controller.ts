// Import necessary modules and services
import { Controller, Get, Post, Body, Param, Patch, Req, Res, Delete, Query, UseGuards } from "@nestjs/common";
import { UpdateLessonPlanDto } from "./dtos/updateLessonPlans.dto";
import { commonResponse } from "helper";
import { ApiBearerAuth, ApiTags, ApiParam, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "src/decorator/role_decorator";
import { ROLE } from "helper/constants";
import { SubjectService } from "../subject/subject.service";
import { AuditLogService } from "../audit_log/audit-log.service";
import { StudentService } from "../student/student.service";
import { CreateLessonPlanDto } from "./dtos/createLessonPlans.dto";
import { TeacherService } from "../teacher/teacher.service";
import { LessonPlanService } from "./lesson_plans.service";
import { DivisionSubjectService } from "../division_subject/divisionsubject.service";
import { MasterSubjectService } from "../master_subject/master-subject.service";
import { UsersService } from "../users/user.service";

// Define the LessonPlanController class
@Controller("lesson-plan")
@ApiBearerAuth()
@ApiTags("Lesson Plan")
export class LessonPlanController {
    // Constructor for dependency injection
    constructor(
        private readonly studentService: StudentService,
        private lessonPlanServices: LessonPlanService,
        private subjectService: SubjectService,
        private readonly auditLogService: AuditLogService,
        private readonly teacherService: TeacherService,
        private readonly divisionSubjectService: DivisionSubjectService,
        private readonly masterServices: MasterSubjectService,
        private readonly usersService: UsersService
    ) {}

    // Method to create a new lesson plan
    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Post("/create")
    async createLessonPlan(@Body() createLessonPlanDto: CreateLessonPlanDto, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            // Add created_by field to the createLessonPlanDto object
            createLessonPlanDto["created_by"] = req.user.userId;

            // Find the subject using the subject_id from the createLessonPlanDto object
            let findSubject = await this.subjectService.getSubjectById(Number(createLessonPlanDto.subject_id));

            // Add master_subject_id field to the createLessonPlanDto object
            createLessonPlanDto["master_subject_id"] = findSubject.master_subject_id;

            // Check if the user is a teacher
            if (req.user.role_name == ROLE.TEACHER) {
                // Find the teacher using the teacher_user_id from the request object
                let teacherId = await this.teacherService.getTeacherByObj({ teacher_user_id: req.user.userId });

                // If the teacher is not found, return an error response
                if (!teacherId) {
                    return commonResponse.error(languageCode, res, "TEACHER_NOT_FOUND", 400, {});
                } else {
                    // Add teacher_id field to the createLessonPlanDto object
                    createLessonPlanDto["teacher_id"] = teacherId.id;
                }
            }

            // Create a new lesson plan using the create method from the LessonPlanService
            const createdLessonPlan = await this.lessonPlanServices.create(createLessonPlanDto);

            let creatorRole = await this.usersService.findById(req.user.userId);
            // let instituteInfo = await this.instituteService.getInstituteById(updatedData.school_id);

            let masterSubject = await this.masterServices.getMasterSubjectById(findSubject.master_subject_id);

            // Create an audit log for the created lesson plan
            await this.auditLogService.create({
                action: "CREATE",
                message: `Lesson Plan has been created for the subject "${masterSubject.subject_name}" by "${creatorRole?.user_name}" holding the role of "${creatorRole?.role?.role_name}".`,
                old_data: null,
                new_data: createdLessonPlan,
                action_user_id: req.user.userId,
                school_id: createdLessonPlan.school_id,
                role_id: req.user.role_id,
            });

            // If the lesson plan is created successfully, map the students to the lesson plan
            if (createdLessonPlan) {
                const divisionSubject = await this.divisionSubjectService.customFindBuQuery({
                    where: {
                        subject_id: Number(createLessonPlanDto.subject_id),
                        grade_class_id: createLessonPlanDto.grade_class_id,
                        grade_id: createLessonPlanDto.grade_id,
                    },
                    relations: ["students"],
                });

                // Insert students id
                let studentsArray: any = [];
                divisionSubject.map((data) => {
                    data.students.map((students) => {
                        this.lessonPlanServices.addStudent(createdLessonPlan.id, students.id);
                        studentsArray.push(students.id);
                    });
                });
            }

            // Return a success response with the created lesson plan
            return commonResponse.success(languageCode, res, "LESSON_PLAN_CREATED", 200, createdLessonPlan);
        } catch (error) {
            // Log the error and return a server error response
            console.log("divisoin subjve", error);
            return commonResponse.error(languageCode, res, "SERVER_ERROR", 500, {});
        }
    }

    /**
     * Retrieve a list of lesson plans with optional filtering and pagination
     *
     * This endpoint allows fetching a list of lesson plans with various query parameters
     * for filtering and pagination. It's accessible to Master Admin, Sub Admin, Teacher,
     * and Department of Education roles.
     *
     * @param req - The request object
     * @param res - The response object
     * @param query - Query parameters for filtering and pagination
     * @returns A list of lesson plans matching the query criteria
     */
    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
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
    @ApiQuery({ name: "grade_class_id", required: false, type: Number, example: 1, description: "Filter by grade_class_id" })
    @ApiQuery({ name: "master_subject_id", required: false, type: Number, example: 1, description: "Filter by master_subject_id" })
    @ApiQuery({ name: "subject_id", required: false, type: Number, example: 1, description: "Filter by subject_id" })
    @ApiQuery({ name: "teacher_id", required: false, type: Number, example: 1, description: "Filter by teacher_id" })
    @ApiQuery({ name: "term_id", required: false, type: Number, example: 1, description: "Filter by term_id" })
    @ApiQuery({ name: "batch_id", required: false, type: Number, example: 1, description: "Filter by batch_id" })
    async lessonPlansList(@Req() req, @Res() res, @Query() query: any) {
        const languageCode = req.headers["language_code"];
        try {
            const lessonPlans = await this.lessonPlanServices.findAll(query);
            return commonResponse.success(languageCode, res, "LESSON_PLAN_LIST", 200, lessonPlans);
        } catch (error) {
            console.log("🚀 ~ file: lesson_plans.controller.ts:116 ~ LessonPlanController ~ lessonPlansList ~ error:", error);
            return commonResponse.error(languageCode, res, "SERVER_ERROR", 500, {});
        }
    }

    /*
     *  Endpoint to retrieve a specific lesson plan by ID
     */

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Get(":id")
    @ApiParam({
        name: "id",
        required: true,
        type: Number,
        description: "Lesson Plan ID",
    })
    async getLessonPlanById(@Param("id") id: number, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            const divisionSubject = await this.lessonPlanServices.findById(id);
            return commonResponse.success(languageCode, res, "LESSON_PLAN_DETAILS", 200, divisionSubject);
        } catch (error) {
            return commonResponse.error(languageCode, res, "SERVER_ERROR", 500, {});
        }
    }

    /*
     *   Update Lesson Plan
     */
    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Patch("patch/:id")
    @ApiParam({
        name: "id",
        required: true,
        type: Number,
        description: "Lesson Plan ID",
    })
    async updateLessonPlan(@Param("id") id: number, @Body() updateLessonplanDto: UpdateLessonPlanDto, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            const checkExist = await this.lessonPlanServices.isExist(id);
            if (!checkExist) {
                return commonResponse.error(languageCode, res, "LESSON_PLAN_NOT_FOUND", 400, {});
            }

            const oldGrade = JSON.parse(JSON.stringify(checkExist));
            const updatedLessonPlan = await this.lessonPlanServices.update(id, updateLessonplanDto);

            if (updatedLessonPlan) {
                await this.auditLogService.create({
                    action: "UPDATE",
                    message: `Lesson Plan ${updatedLessonPlan.grade_class_id} updated.`,
                    old_data: oldGrade,
                    new_data: updatedLessonPlan,
                    action_user_id: req.user.userId,
                    school_id: updatedLessonPlan.school_id,
                    role_id: req.user.role_id,
                });

                return commonResponse.success(languageCode, res, "LESSON_PLAN_UPDATED", 200, updatedLessonPlan);
            }
        } catch (error) {
            return commonResponse.error(languageCode, res, "SERVER_ERROR", 500, {});
        }
    }

    /*
     *   Delete lesson plans by id
     */
    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Delete("delete/:id")
    @ApiParam({
        name: "id",
        required: true,
        type: Number,
        description: "Lesson Plan ID",
    })
    async deleteLessonPlan(@Param("id") id: number, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            let checkExist = await this.lessonPlanServices.isExist(id);

            if (!checkExist) {
                return commonResponse.error(languageCode, res, "LESSON_PLAN_NOT_FOUND", 404, {});
            }

            console.log("checkExistcheckExistcheckExist", checkExist);

            const oldData = checkExist ? JSON.parse(JSON.stringify(checkExist)) : {};

            //  Retrieve all students mapped to the current subject_id
            const students = await this.lessonPlanServices.getMappedStudents(id);

            if (students.length > 0) {
                // Update mapping to the new subject_id
                let query = {
                    where: {
                        grade_id: checkExist.grade_id,
                        grade_class_id: checkExist.grade_class_id,
                        subject_id: checkExist.subject_id,
                        term_id: checkExist.term_id,
                        batch_id: checkExist.batch_id,
                    },
                    excludeId: id,
                };
                let findNewSubjectId = await this.lessonPlanServices.findUniqTeacher(query);

                if (findNewSubjectId && findNewSubjectId?.length) {
                    console.log("findNewSubjectId", findNewSubjectId[0]?.id);
                    let newSubjectId = findNewSubjectId[0]?.id;
                    await this.studentService.remapStudents(id, newSubjectId, students);
                } else {
                    return commonResponse.error(languageCode, res, "DIVISION_SUBJECT_NOT_ASSIGN", 400, {});
                }
            }

            await this.lessonPlanServices.delete(id);

            const deletedAt = new Date();
            const auditLogData = {
                action: "DELETE",
                message: `Lesson Plan ${checkExist.grade_class_id} deleted.`,
                old_data: oldData,
                new_data: null,
                action_user_id: req.user.userId,
                role_id: req.user.role_id,
                school_id: checkExist.school_id,
                deleted_at: deletedAt,
            };
            await this.auditLogService.create(auditLogData);
            return commonResponse.success(languageCode, res, "LESSON_PLAN_DELETED", 200, {});
        } catch (error) {
            console.log("🚀 ~ file: lesson_plans.controller.ts:293 ~ LessonPlanController ~ deleteDivisionSubject ~ error:", error);
            return commonResponse.error(languageCode, res, "SERVER_ERROR", 500, {});
        }
    }
}
