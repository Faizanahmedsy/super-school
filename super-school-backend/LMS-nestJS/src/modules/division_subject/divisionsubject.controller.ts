import { Controller, Get, Post, Body, Param, Patch, Req, Res, Delete, Query, UseGuards } from "@nestjs/common";
import { DivisionSubjectService } from "../division_subject/divisionsubject.service";
import { CreateDivisionSubjectDto } from "../division_subject/dtos/create-divisionsubject.dto";
import { UpdateDivisionSubjectDto } from "./dtos/update-divisionsubject.dto";
import { commonResponse } from "helper";
import { ApiBearerAuth, ApiTags, ApiParam, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "src/decorator/role_decorator";
import { ROLE } from "helper/constants";
import { MultiCreateSubjectTeacherDto } from "./dtos/multi-create-subject-teacher.dto";
import { SubjectService } from "../subject/subject.service";
import { AuditLogService } from "../audit_log/audit-log.service";
import { StudentService } from "../student/student.service";
import { TermService } from "../term/term.service";
import { UnassignSubject } from "./dtos/unassign-divisionsubject.dto";
import { LearnerTeacherListDto } from "./dtos/learner-teacher-list.dto";
interface SubjectTeacher {
    school_id: number;
    batch_id: number;
    term_id: number;
    grade_id: number;
    grade_class_id: number;
    subject_id: number;
    master_subject_id: number;
    teacher_id: number;
    created_by: number;
}
@Controller("division-subject")
@ApiBearerAuth()
@ApiTags("Division Subject")
export class DivisionSubjectController {
    constructor(
        private readonly studentService: StudentService,
        private divisionSubjectService: DivisionSubjectService,
        private subjectService: SubjectService,
        private readonly auditLogService: AuditLogService,
        private termServices: TermService
    ) {}

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Post("/create")
    async createDivisionSubject(@Body() createDivisionSubjectDto: CreateDivisionSubjectDto, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            createDivisionSubjectDto["created_by"] = req.user.userId;
            let findSubject = await this.subjectService.getSubjectById(Number(createDivisionSubjectDto.subject_id));
            createDivisionSubjectDto["master_subject_id"] = findSubject.master_subject_id;
            const createdDivisionSubject = await this.divisionSubjectService.create(createDivisionSubjectDto);
            await this.auditLogService.create({
                action: "CREATE",
                message: `Class Subjects ${createdDivisionSubject.grade_class_id} created.`,
                old_data: null,
                new_data: createdDivisionSubject,
                action_user_id: req.user.userId,
                school_id: createdDivisionSubject.school_id,
                role_id: req.user.role_id,
            });
            return commonResponse.success(languageCode, res, "DIVISION_SUBJECT_CREATED", 200, createdDivisionSubject);
        } catch (error) {
            console.log("divisoin subjve", error);
            return commonResponse.error(languageCode, res, "SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION)
    @Post("teacher/setup")
    async createTeacherSubject(@Body() multiCreateSubjectTeacherDto: MultiCreateSubjectTeacherDto, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            let totalAdd: SubjectTeacher[] = [];
            let termMaster = await this.termServices.getTermByObject({
                where: { school_id: multiCreateSubjectTeacherDto.school_id, batch_id: multiCreateSubjectTeacherDto.batch_id },
            });

            for (let index = 0; index < multiCreateSubjectTeacherDto.subjects.length; index++) {
                const element = multiCreateSubjectTeacherDto.subjects[index];
                let findSubject = await this.subjectService.getSubjectById(Number(element.subject_id));

                let checkExist = await this.divisionSubjectService.isExistCheckWithQuery({
                    school_id: multiCreateSubjectTeacherDto.school_id,
                    batch_id: element.batch_id,
                    // term_id: findSubject.term_id,
                    grade_id: element.grade_id,
                    grade_class_id: element.grade_class_id,
                    subject_id: element.subject_id,
                    master_subject_id: findSubject.master_subject_id,
                    teacher_id: multiCreateSubjectTeacherDto.teacher_id,
                });

                if (!checkExist) {
                    // loop over terms
                    for (let term of termMaster) {
                        let object = {
                            school_id: multiCreateSubjectTeacherDto.school_id,
                            batch_id: element.batch_id,
                            term_id: Number(term.id),
                            grade_id: element.grade_id,
                            grade_class_id: element.grade_class_id,
                            subject_id: element.subject_id,
                            master_subject_id: Number(findSubject.master_subject_id),
                            teacher_id: multiCreateSubjectTeacherDto.teacher_id,
                            created_by: req.user.userId,
                        };
                        totalAdd.push(object);
                    }
                }
            }
            if (totalAdd?.length == 0) {
                return commonResponse.error(languageCode, res, "DIVISION_SUBJECT_ALREADY_EXISTS", 409, {});
            }
            const createData = totalAdd;

            if (createData && createData.length > 0) {
                await this.auditLogService.create({
                    action: "CREATE",
                    message: `Class Subjects created  ${createData[0].grade_class_id}.`,
                    old_data: null,
                    new_data: createData,
                    action_user_id: req.user.userId,
                    role_id: req.user.role_id,
                });
            }

            const createdDivisionSubject = await this.divisionSubjectService.addSubjectToTeacher(totalAdd);
            return commonResponse.success(languageCode, res, "DIVISION_SUBJECT_CREATED", 200, createdDivisionSubject);
        } catch (error) {
            console.log("errorerrorerror", error);
            return commonResponse.error(languageCode, res, "SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Get("/learner-teacher-list")
    async getLearnerAndTeacherList(@Query() query: LearnerTeacherListDto, @Req() req: any, @Res() res: any) {
        const languageCode = req.headers["language_code"];
        try {
            let userList = await this.divisionSubjectService.fetchUserLearnerList(query);
            return commonResponse.success(languageCode, res, "LEARNER_TEACHER_LIST", 200, userList);
        } catch (error) {
            console.log("🚀 ~ DivisionSubjectController ~ getLearnerAndTeacherList ~ error:", error);
            return commonResponse.error(languageCode, res, "SERVER_ERROR", 500, {});
        }
    }

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
    @ApiQuery({ name: "checkStudent", required: false, type: Boolean, example: true, description: "Filter based on student exist in the subject" })
    async listDivisionSubjects(@Req() req, @Res() res, @Query() query: any) {
        const languageCode = req.headers["language_code"];
        try {
            const divisionSubjects = await this.divisionSubjectService.findAll(query);
            return commonResponse.success(languageCode, res, "DIVISION_SUBJECT_LIST", 200, divisionSubjects);
        } catch (error) {
            return commonResponse.error(languageCode, res, "SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Get(":id")
    @ApiParam({
        name: "id",
        required: true,
        type: Number,
        description: "Division Subject ID",
    })
    async getDivisionSubjectById(@Param("id") id: number, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            const divisionSubject = await this.divisionSubjectService.findById(id);
            return commonResponse.success(languageCode, res, "DIVISION_SUBJECT_DETAILS", 200, divisionSubject);
        } catch (error) {
            return commonResponse.error(languageCode, res, "SERVER_ERROR", 500, {});
        }
    }
    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Patch("patch/:id")
    @ApiParam({
        name: "id",
        required: true,
        type: Number,
        description: "Division Subject ID",
    })
    async updateDivisionSubject(@Param("id") id: number, @Body() updateDivisionSubjectDto: UpdateDivisionSubjectDto, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            const checkExist = await this.divisionSubjectService.isExist(id);
            if (!checkExist) {
                return commonResponse.error(languageCode, res, "DIVISION_NOT_FOUND", 400, {});
            }

            const oldGrade = JSON.parse(JSON.stringify(checkExist));
            const updatedDivisionSubject = await this.divisionSubjectService.update(id, updateDivisionSubjectDto);

            if (updatedDivisionSubject) {
                await this.auditLogService.create({
                    action: "UPDATE",
                    message: `Class Subjects ${updatedDivisionSubject.grade_class_id} updated.`,
                    old_data: oldGrade,
                    new_data: updatedDivisionSubject,
                    action_user_id: req.user.userId,
                    school_id: updatedDivisionSubject.school_id,
                    role_id: req.user.role_id,
                });

                return commonResponse.success(languageCode, res, "DIVISION_SUBJECT_UPDATED", 200, updatedDivisionSubject);
            }
        } catch (error) {
            return commonResponse.error(languageCode, res, "SERVER_ERROR", 500, {});
        }
    }

    // @UseGuards(JwtAuthGuard)
    // @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    // @Delete("delete/:id")
    // @ApiParam({
    //     name: "id",
    //     required: true,
    //     type: Number,
    //     description: "Division Subject ID",
    // })
    // async deleteDivisionSubject(@Param("id") id: number, @Req() req, @Res() res) {
    //     const languageCode = req.headers["language_code"];
    //     try {
    //         let checkExist = await this.divisionSubjectService.isExist(id);

    //         if (!checkExist) {
    //             return commonResponse.error(languageCode, res, "DIVISION_NOT_FOUND", 404, {});
    //         }

    //         console.log("checkExistcheckExistcheckExist", checkExist);

    //         const oldData = checkExist ? JSON.parse(JSON.stringify(checkExist)) : {};

    //         //  Retrieve all students mapped to the current subject_id
    //         const students = await this.studentService.getMappedStudents(id);

    //         if (students.length > 0) {
    //             // Update mapping to the new subject_id
    //             let query = {
    //                 where: {
    //                     grade_id: checkExist.grade_id,
    //                     grade_class_id: checkExist.grade_class_id,
    //                     subject_id: checkExist.subject_id,
    //                     term_id: checkExist.term_id,
    //                     batch_id: checkExist.batch_id,
    //                 },
    //                 excludeId: id,
    //             };
    //             let findNewSubjectId = await this.divisionSubjectService.findUniqTeacher(query);

    //             if (findNewSubjectId && findNewSubjectId?.length) {
    //                 console.log("findNewSubjectId", findNewSubjectId[0]?.id);
    //                 let newSubjectId = findNewSubjectId[0]?.id;
    //                 await this.studentService.remapStudents(id, newSubjectId, students);
    //             } else {
    //                 return commonResponse.error(languageCode, res, "DIVISION_SUBJECT_NOT_ASSIGN", 400, {});
    //             }
    //         }

    //         await this.divisionSubjectService.delete(id);

    //         const deletedAt = new Date();
    //         const auditLogData = {
    //             action: "DELETE",
    //             message: `Class Subjects ${checkExist.grade_class_id} deleted.`,
    //             old_data: oldData,
    //             new_data: null,
    //             action_user_id: req.user.userId,
    //             role_id: req.user.role_id,
    //             school_id: checkExist.school_id,
    //             deleted_at: deletedAt,
    //         };
    //         await this.auditLogService.create(auditLogData);
    //         return commonResponse.success(languageCode, res, "DIVISION_SUBJECT_DELETED_SUCCESS", 200, {});
    //     } catch (error) {
    //         console.log("errorerrorerrorerrorerror", error);
    //         return commonResponse.error(languageCode, res, "SERVER_ERROR", 500, {});
    //     }
    // }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION, ROLE.TEACHER)
    @Post("unassign-subject")
    async unassignSubjectFromTeacher(@Body() body: UnassignSubject, @Req() req: any, @Res() res: any) {
        const languageCode = req.headers["language_code"];
        try {
            let query = {
                school_id: body.school_id,
                teacher_id: body.teacher_id,
                grade_id: body.grade_id,
                grade_class_id: body.grade_class_id,
                subject_id: body.subject_id,
                batch_id: body.batch_id,
            };
            console.log("🚀 ~ DivisionSubjectController ~ unassignSubjectFromTeacher ~ query:", query);

            let isExistCurrentTeacher = await this.divisionSubjectService.findClassSubject(query);
            if (!isExistCurrentTeacher?.length) {
                // something went wrong
            }

            let classSubjectIds = isExistCurrentTeacher.map((data) => data.id);
            // fetch all students from the table classSubjectStudent
            let fetchAssociatedStudent = await this.divisionSubjectService.findAssociateStudents(classSubjectIds);
            console.log("🚀 ~ DivisionSubjectController ~ unassignSubjectFromTeacher ~ fetchAssociatedStudent:", fetchAssociatedStudent);

            query.teacher_id = body.assign_to_teacher_id;
            let newClassSubjects = await this.divisionSubjectService.findClassSubject(query);

            const newClassSubjectMap = new Map(newClassSubjects.map((cs) => [cs.term_id, cs.id]));
            console.log("🚀 ~ DivisionSubjectController ~ unassignSubjectFromTeacher ~ newClassSubjectMap:", newClassSubjectMap);

            let arrayData = [];
            for (const studentRecord of fetchAssociatedStudent) {
                const oldClassSubject = isExistCurrentTeacher.find((cs) => String(cs.id) == String(studentRecord.css_classsubject_id));
                console.log("🚀 ~ DivisionSubjectController ~ unassignSubjectFromTeacher ~ oldClassSubject:", oldClassSubject);
                if (!oldClassSubject) continue;

                const newClassSubjectId = newClassSubjectMap.get(oldClassSubject.term_id);
                console.log("🚀 ~ DivisionSubjectController ~ unassignSubjectFromTeacher ~ newClassSubjectId:", newClassSubjectId);
                if (newClassSubjectId) {
                    let object = {
                        id: studentRecord.id,
                        class_subject_id: newClassSubjectId,
                    };
                    arrayData.push(object);
                    await this.divisionSubjectService.updateClassSubjectStudent(newClassSubjectId, studentRecord.id);
                }
            }

            return commonResponse.success(languageCode, res, "STUDENT_FETCH", 200, arrayData);
        } catch (error) {
            console.log("🚀 ~ DivisionSubjectController ~ unassignSubjectFromTeacher ~ error:", error);
            return commonResponse.error(languageCode, res, "SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.DEPARTMENT_OF_EDUCTION)
    @Delete("delete/:id")
    @ApiParam({
        name: "id",
        required: true,
        type: Number,
        description: "Division Subject ID",
    })
    async deleteDivisionSubject(@Param("id") id: number, @Req() req, @Res() res) {
        const languageCode = req.headers["language_code"];
        try {
            let checkExist = await this.divisionSubjectService.isExist(id);

            if (!checkExist) {
                return commonResponse.error(languageCode, res, "DIVISION_NOT_FOUND", 404, {});
            }

            let query = {
                grade_id: checkExist.grade_id,
                grade_class_id: checkExist.grade_class_id,
                master_subject_id: checkExist.master_subject_id,
                subject_id: checkExist.subject_id,
                teacher_id: checkExist.teacher_id,
                school_id: checkExist.school_id,
            };

            let fetchAllRecords = await this.divisionSubjectService.getDivisionSubjectByQuery(query);
            console.log("🚀 ~ DivisionSubjectController ~ deleteDivisionSubject ~ fetchAllRecords:", fetchAllRecords);
            let classSubjectIds = fetchAllRecords.map((data) => data.id);

            if (classSubjectIds?.length) {
                // fetch all student from
                let associateStudent = await this.divisionSubjectService.findAssociateStudents(classSubjectIds);
                if (associateStudent?.length) {
                    return commonResponse.error(languageCode, res, "YOU_CANNOT_DELETE_THIS_SUBJECT", 400, {});
                }
            }
            // delete all related entries along with term for that subject assign to teacher
            fetchAllRecords = fetchAllRecords.map((data) => {
                data["deleted_at"] = new Date();
                data["deleted_by"] = req.user.userId;
                return data;
            });
            let saveRecords = await this.divisionSubjectService.softDeleteDivisionSubject(fetchAllRecords);
            if (!saveRecords) {
                return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
            }
            return commonResponse.success(languageCode, res, "DIVISION_SUBJECT_DELETED_SUCCESS", 200, {});
        } catch (error) {
            console.log("errorerrorerrorerrorerror", error);
            return commonResponse.error(languageCode, res, "SERVER_ERROR", 500, {});
        }
    }
}
