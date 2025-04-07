import { Controller, Get, Post, Body, Param, Patch, Delete, Req, Res, UseGuards, NotFoundException } from "@nestjs/common";
import { BatchService } from "./batch.service";
import { CreateBatchDto } from "../batch/dtos/create-batch.dto";
import { UpdateBatchDto } from "../batch/dtos/update-batch.dto";
import { commonResponse } from "helper";
import { query, Request, Response } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { LocalAuthGuard } from "../auth/local-auth.guard";
import { Roles } from "src/decorator/role_decorator";
import { RolesGuard } from "../auth/role-auth-guard";
import { ROLE } from "helper/constants";
import { InstituteService } from "../institutes/institutes.service";
import { AuditLogService } from "../audit_log/audit-log.service";
import { TermService } from "../term/term.service";
import { UpdateBatchActiveDto } from "./dtos/update-active-batch.dto";

import { GradeService } from "../grade/grade.service";
import { DivisionService } from "../division/division.service";
import { SubjectService } from "../subject/subject.service";
import { TeacherService } from "../teacher/teacher.service";
import { DivisionSubjectService } from "../division_subject/divisionsubject.service";
import { UsersService } from "../users/user.service";
import { StudyMaterialService } from "../study_materials/study_materials.service";
import { UpdateBatchForSetUpWizard } from "./dtos/update-batch-setup-wizard";
@Controller("batch")
@ApiBearerAuth()
@ApiTags("Batch")
export class BatchController {
    constructor(
        private batchService: BatchService,
        private termService: TermService,
        private instituteService: InstituteService,
        private auditLogService: AuditLogService,
        private subjectService: SubjectService,
        private teacherService: TeacherService,
        private divisionSubjectService: DivisionSubjectService,
        private gradeService: GradeService,
        private divisionService: DivisionService,
        private usersService: UsersService,
        private studyMaterialService: StudyMaterialService
    ) {}

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Post("/create")
    async createBatch(@Body() createBatchDto: CreateBatchDto, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            if (req.user.institute_id) {
                createBatchDto["school_id"] = req.user.institute_id;
            } else {
                if (!createBatchDto.school_id) {
                    return commonResponse.error(languageCode, res, "SCHOOL_REQUIRED", 409, {});
                }
            }
            createBatchDto["created_by"] = req.user.userId;
            const existingBatch = await this.batchService.findBatchByName(createBatchDto.start_year, createBatchDto.school_id);
            if (existingBatch) {
                return commonResponse.error(languageCode, res, "BATCH_ALREADY_EXISTS", 409, {});
            }

            const newBatch = await this.batchService.createBatch(createBatchDto, req.user.userId);
            // if (newBatch) {
            // let instituteInfo = await this.instituteService.getInstituteById(createBatchDto.school_id);
            // if (instituteInfo && instituteInfo.setup == false) {
            //     let id = instituteInfo.id;
            //     delete instituteInfo.id;
            //     let updatePayload = { ...instituteInfo, setup: true };
            //     this.instituteService.updateInstitute(id, updatePayload);
            //     await this.instituteService.updateInstitute(id, updatePayload);
            // }
            // }
            let creatorRole = await this.usersService.findById(req.user.userId);
            let instituteInfo = await this.instituteService.getInstituteById(createBatchDto.school_id);

            await this.auditLogService.create({
                action: "CREATE",
                message: `The batch for the year "${newBatch.start_year}" has been successfully created for the school "${instituteInfo.school_name}" by "${creatorRole?.user_name}" holding the role of "${creatorRole?.role?.role_name}".`,
                old_data: null,
                new_data: newBatch,
                action_user_id: req.user.userId,
                school_id: newBatch.school_id,
                role_id: req.user.role_id,
            });

            return commonResponse.success(languageCode, res, "BATCH_CREATED", 201, newBatch);
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION, ROLE.SUB_ADMIN, ROLE.TEACHER, ROLE.STUDENT)
    @Get("/list")
    @ApiQuery({ name: "sort", required: false, type: String, example: "asc", description: "Sort order (asc/desc)" })
    @ApiQuery({ name: "limit", required: false, type: Number, example: 10, description: "Limit the number of results" })
    @ApiQuery({ name: "page", required: false, type: Number, example: 1, description: "Page number for pagination" })
    @ApiQuery({ name: "search", required: false, type: String, example: "Name", description: "Search by batchName" })
    @ApiQuery({ name: "school_id", required: false, type: Number, example: 1, description: "Filter by school_id" })
    async getBatches(@Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            if (req.user.institute_id) {
                req.query["school_id"] = req.user.institute_id;
            }
            const batches = await this.batchService.getBatch(req.query);
            if (batches) {
                return commonResponse.success(languageCode, res, "BATCH_LIST", 200, batches);
            } else {
                return commonResponse.error(languageCode, res, "NO_BATCHES_FOUND", 404, {});
            }
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Get(":id")
    async getBatchById(@Param("id") id: number, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const batch = await this.batchService.getBatchById(id);
            if (batch) {
                return commonResponse.success(languageCode, res, "BATCH_DETAILS", 200, batch);
            } else {
                return commonResponse.error(languageCode, res, "BATCH_NOT_FOUND", 404, {});
            }
        } catch (error) {
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Patch("patch/:id")
    async updateBatch(@Param("id") id: number, @Body() updateBatchDto: UpdateBatchDto, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            updateBatchDto["updated_by"] = req.user.userId;

            const checkExist = await this.batchService.findBatchById(id);
            if (!checkExist) {
                return commonResponse.error(languageCode, res, "BATCH_NOT_FOUND", 404, {});
            }

            let oldBatch = { ...checkExist };

            const updatedBatch = await this.batchService.updateBatch(id, updateBatchDto);

            if (updatedBatch) {
                const updatedData = this.batchService.getUpdatedData(oldBatch, updatedBatch);

                let creatorRole = await this.usersService.findById(req.user.userId);
                let instituteInfo = await this.instituteService.getInstituteById(updatedData.school_id);

                await this.auditLogService.create({
                    action: "UPDATE",
                    message: `The batch for the year "${updatedData.start_year}" has been successfully updated for the school "${instituteInfo.school_name}" by "${creatorRole?.user_name}" holding the role of "${creatorRole?.role?.role_name}".`,
                    old_data: updatedData.old,
                    new_data: updatedData.new,
                    action_user_id: req.user.userId,
                    school_id: updatedBatch.school_id,
                    role_id: req.user.role_id,
                });

                return commonResponse.success(languageCode, res, "BATCH_UPDATED_SUCCESS", 200, updatedBatch);
            } else {
                return commonResponse.error(languageCode, res, "BATCH_NOT_FOUND", 404, {});
            }
        } catch (error) {
            if (error.code === "BATCH_UPDATE_FAILED") {
                return commonResponse.error(languageCode, res, "BATCH_UPDATE_FAILED", 400, {});
            } else {
                return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
            }
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Post("active")
    async updateActiveBatch(@Body() updateBatchActiveDto: UpdateBatchActiveDto, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const { batch_id } = updateBatchActiveDto;

            // Step 1: Handle Batch Activation
            const getOldActiveBatch = await this.batchService.getPreviousActiveBatch(batch_id);
            if (getOldActiveBatch) await this.batchService.deactivateBatch(Number(getOldActiveBatch.id));

            const getNewActiveBatch = await this.batchService.getBatchById(batch_id);
            if (!getNewActiveBatch) return commonResponse.error(languageCode, res, "BATCH_NOT_FOUND", 404, {});

            if (!getNewActiveBatch.is_active) await this.batchService.activateBatch(batch_id);

            // Step 2: Clone Terms
            const allTerms = await this.cloneTerms(getOldActiveBatch.id, getNewActiveBatch.id);
            console.log("🚀 ~ BatchController ~ updateActiveBatch ~ allTerms:", allTerms);

            // Step 3: Clone Grades
            const allGrades = await this.cloneGrades(getOldActiveBatch.id, getNewActiveBatch.id, req.user.userId);
            console.log("🚀 ~ BatchController ~ updateActiveBatch ~ allGrades:", allGrades);

            // Step 4: Clone Divisions
            const allDivisions = await this.cloneDivisions(getOldActiveBatch.id, getNewActiveBatch.id, req.user.userId, allGrades);
            console.log("🚀 ~ BatchController ~ updateActiveBatch ~ allDivisions:", allDivisions);

            // Step 5: Clone Subjects
            const allSubjects = await this.cloneSubjects(getOldActiveBatch.id, getNewActiveBatch.id, req.user.userId, allGrades);
            console.log("🚀 ~ BatchController ~ updateActiveBatch ~ allSubjects:", allSubjects);

            // Step 6: Clone Division Subjects
            await this.cloneDivisionSubjects(getOldActiveBatch.id, getNewActiveBatch.id, allTerms, allGrades, allDivisions, allSubjects, req.user.userId);

            // Step 7: Clone Study Materials
            await this.cloneStudyMaterials(getOldActiveBatch.id, getNewActiveBatch.id);

            return commonResponse.success(languageCode, res, "BATCH_UPDATED", 200, {
                terms: allTerms,
                grades: allGrades,
                divisions: allDivisions,
                subjects: allSubjects,
                classSubjects: [],
            });
        } catch (error) {
            console.error("Error updating batch:", error);
            return commonResponse.error(languageCode, res, "BATCH_UPDATE_FAILED", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Delete("delete/:id")
    async deleteBatch(@Param("id") id: number, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            const checkExist = await this.batchService.findBatchById(id);
            if (!checkExist) {
                return commonResponse.error(languageCode, res, "BATCH_NOT_FOUND", 404, {});
            }

            let oldData = { ...checkExist };

            await this.batchService.deleteBatch(id);
            let creatorRole = await this.usersService.findById(req.user.userId);
            let instituteInfo = await this.instituteService.getInstituteById(checkExist.school_id);

            const auditLogData = {
                action: "DELETE",
                message: `The batch for the year "${checkExist.start_year}" has been successfully deleted from the school "${instituteInfo.school_name}" by "${creatorRole?.user_name}" holding the role of "${creatorRole?.role?.role_name}".`,
                old_data: oldData,
                new_data: null,
                action_user_id: req.user.userId,
                school_id: checkExist.school_id,
                role_id: req.user.role_id,
            };

            await this.auditLogService.create(auditLogData);

            return commonResponse.success(languageCode, res, "BATCH_DELETED_SUCCESS", 200, {});
        } catch (error) {
            if (error instanceof NotFoundException) {
                return commonResponse.error(languageCode, res, "BATCH_NOT_FOUND", 404, {});
            }
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    // Helper function to clone terms
    private async cloneTerms(oldBatchId: number, newBatchId: number) {
        const oldTerms = await this.termService.getTermsByBatchId(oldBatchId);
        const newTerms = await this.termService.getTermsByBatchId(newBatchId);

        return oldTerms.map((oldTerm, index) => ({
            old_term: oldTerm,
            new_term: newTerms[index],
        }));
    }

    // Helper function to clone grades
    private async cloneGrades(oldBatchId: number, newBatchId: number, userId: number) {
        const oldGrades = await this.gradeService.getGradeByBatchId(oldBatchId);
        const allGrades = [];

        for (const oldGrade of oldGrades) {
            const { id: oldGradeId, ...gradeData } = oldGrade;
            const newGrade = { ...gradeData, batch_id: newBatchId, created_by: userId };
            const createdGrade = await this.gradeService.createGrade(newGrade);

            allGrades.push({
                old_grade: { id: oldGradeId, ...gradeData },
                new_grade: createdGrade,
            });
        }
        return allGrades;
    }

    // Helper function to clone divisions
    private async cloneDivisions(oldBatchId: number, newBatchId: number, userId: number, allGrades: any[]) {
        const oldDivisions = await this.divisionService.getDivisionByBatchId(oldBatchId);
        const allDivisions = [];

        for (const oldDivision of oldDivisions) {
            const { id: oldDivisionId, grade_id, ...divisionData } = oldDivision;
            const newGrade = allGrades.find((val) => val?.old_grade?.id == grade_id);
            const newDivision = { ...divisionData, batch_id: newBatchId, grade_id: newGrade.new_grade.id, created_by: userId };

            const createdDivision = await this.divisionService.createDivision(newDivision);
            allDivisions.push({ old_division: { id: oldDivisionId, ...divisionData }, new_division: createdDivision });
        }
        return allDivisions;
    }

    // Helper function to clone subjects
    private async cloneSubjects(oldBatchId: number, newBatchId: number, userId: number, allGrades: any[]) {
        const oldSubjects = await this.subjectService.getSubjectByBatchId1(oldBatchId);
        const allSubjects = [];

        for (const subject of oldSubjects) {
            const { id, grade_id, ...subjectData } = subject;
            const newGrade = allGrades.find((grade) => grade.old_grade.id == grade_id);
            const newSubject = { ...subjectData, batch_id: newBatchId, grade_id: newGrade?.new_grade?.id, created_by: userId };

            const createdSubject = await this.subjectService.createSubject(newSubject);
            allSubjects.push({ new_subject: createdSubject, old_subject: subject });
        }
        return allSubjects;
    }

    // Helper function to clone division subjects
    private async cloneDivisionSubjects(oldBatchId: number, newBatchId: number, allTerms, allGrades, allDivisions, allSubjects, userId) {
        const oldClassSubjects = await this.divisionSubjectService.getDivisionSubjectByBatchId(oldBatchId);
        let oldTeacherIdSet = new Set();

        const newClassSubjects = oldClassSubjects.map((divisionSubject) => {
            const { id, term_id, grade_id, grade_class_id, subject_id, teacher_id, ...otherData } = divisionSubject;
            const newTerm = allTerms.find((term) => term.old_term.id == term_id);
            const newGrade = allGrades.find((grade) => grade.old_grade.id == grade_id);
            const newDivision = allDivisions.find((division) => division.old_division.id == grade_class_id);
            const newSubject = allSubjects.find((subject) => subject.old_subject.id == subject_id);

            if (teacher_id) oldTeacherIdSet.add(teacher_id);

            return {
                ...otherData,
                batch_id: newBatchId,
                grade_id: newGrade?.new_grade?.id,
                grade_class_id: newDivision?.new_division?.id,
                subject_id: newSubject?.new_subject?.id,
                term_id: newTerm?.new_term?.id,
                created_by: userId || null,
                teacher_id: teacher_id,
            };
        });
        console.log("🚀 ~ BatchController ~ newClassSubjects ~ newClassSubjects:", newClassSubjects);

        const oldTeacherIds = Array.from(oldTeacherIdSet).map(String);
        console.log("🚀 ~ BatchController ~ cloneDivisionSubjects ~ oldTeacherIds:", oldTeacherIds);
        await this.divisionSubjectService.createBulk(newClassSubjects);
        await this.teacherService.updateBatchIdForTeachers(oldTeacherIds, String(newBatchId));
    }

    // Helper function to clone study materials
    private async cloneStudyMaterials(oldBatchId: number, newBatchId: number) {
        console.log("🚀 ~ file: batch.controller.ts:494 ~ BatchController ~ cloneStudyMaterials ~ newBatchId:", newBatchId);
        const oldStudyMaterials = await this.studyMaterialService.customFindBuQuery({ where: { batch_id: oldBatchId } });

        if (oldStudyMaterials.length) {
            const newStudyMaterials = oldStudyMaterials.map((material) => ({
                ...material,
                batch_id: newBatchId,
            }));
            await this.studyMaterialService.bulkInsert(newStudyMaterials);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Patch("/update-batch-for-setup-wizard")
    async updateBatchforSetUpWizard(@Body() body: UpdateBatchForSetUpWizard, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            if (req?.user?.institute_id) {
                body["school_id"] = req.user.institute_id;
            } else {
                if (!body?.school_id) {
                    return commonResponse.error(languageCode, res, "SCHOOL_REQUIRED", 409, {});
                }
            }

            let fetchAllBatch = await this.batchService.getBatchByQuery({ school_id: body.school_id });
            if (fetchAllBatch) {
                let updatedPayload = { ...fetchAllBatch, ...body };
                let updateData = await this.batchService.updateByQuery(updatedPayload);
                if (!updateData) {
                    return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
                }
                return commonResponse.success(languageCode, res, "BATCH_CREATED", 201, updateData);
            }
            body["created_by"] = req.user.userId;
            let newCreatedBatch = await this.batchService.createBatch(body, req.user.userId);
            if (!newCreatedBatch) {
                return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
            }
            return commonResponse.success(languageCode, res, "BATCH_CREATED", 201, newCreatedBatch);
        } catch (error) {
            console.log("🚀 ~ BatchController ~ updateBatchforSetUpWizard ~ error:", error);
            return commonResponse.error(languageCode, res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {});
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(ROLE.MASTER_ADMIN, ROLE.DEPARTMENT_OF_EDUCTION, ROLE.SUB_ADMIN, ROLE.TEACHER)
    @Post("new-active")
    async recreateSchoolDataBasedOnActiveBatch(@Body() body: UpdateBatchActiveDto, @Req() req: Request, @Res() res: Response) {
        const languageCode = req.headers["language_code"];
        try {
            if (req?.user?.institute_id) {
                body["school_id"] = req.user.institute_id;
            } else {
                if (!body?.school_id) {
                    return commonResponse.error(languageCode, res, "SCHOOL_REQUIRED", 409, {});
                }
            }
            // batch need to active
            let { batch_id } = body;

            let newBatch = await this.batchService.isExist({ id: batch_id });
            if (!newBatch) {
                return commonResponse.error(languageCode, res, "BATCH_DATA_NOT_FOUND", 404, {});
            }

            // if batch is already active
            if (newBatch?.is_active) {
                return commonResponse.error(languageCode, res, "BATCH_UPDATED", 200, {});
            }
            let oldActiveBatch = await this.batchService.isExist({ school_id: body.school_id, is_active: true });
            if (!oldActiveBatch) {
                return commonResponse.error(languageCode, res, "NO_OLD_ACTIVE_BATCH_EXIST", 404, {});
            }
            // Deactive all Active batch
            console.log("🚀 ~ BatchController ~ recreateSchoolDataBasedOnActiveBatch ~ oldActiveBatch:", oldActiveBatch);
            let deactiveBatch = await this.batchService.getBatchesByQuery({ school_id: body.school_id, is_active: true });
            if (deactiveBatch?.length) {
                deactiveBatch = deactiveBatch.map((data) => {
                    data.is_active = false;
                    return data;
                });
                await this.batchService.updateByQuery(deactiveBatch);
            }

            // Activate current batch
            let batchUpdated = await this.batchService.updateByQuery(deactiveBatch);
            console.log("🚀 ~ BatchController ~ recreateSchoolDataBasedOnActiveBatch ~ batchUpdated:", batchUpdated);
            if (!batchUpdated) {
                return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
            }

            // Created Duplicate Records as per the new batch

            // // Step 1: Clone Terms
            let oldTerm = await this.termService.getTermByObject({ school_id: body.school_id, batch_id: oldActiveBatch.id });
            console.log("🚀 ~ BatchController ~ recreateSchoolDataBasedOnActiveBatch ~ oldTerm:", oldTerm);
            if (!oldTerm?.length) {
                return commonResponse.error(languageCode, res, "SERVER_ERROR", 404, {});
            }
            let isExistNewTerm = await this.termService.getTermByObject({ school_id: body.school_id, batch_id: newBatch.id });

            console.log("🚀 ~ BatchController ~ recreateSchoolDataBasedOnActiveBatch ~ isExistNewTerm:", isExistNewTerm);
            if (!isExistNewTerm?.length) {
                return commonResponse.error(languageCode, res, "TERM_ALREADY_CREATED", 400, {});
            }
            // // Create Duplicate Batch
            // let newTermsToCreate = [];
            // oldTerm.forEach((data) => {
            //     let { term_name, school_id, status, start_date, end_date } = data;
            //     newTermsToCreate.push({ term_name, school_id, status, start_date, end_date, batch_id: newBatch.id });
            // });
            // console.log("========newTermsToCreate===========", newTermsToCreate);

            // Step 2: Clone Grade

            let oldGrades = await this.gradeService.geGradeByQuery({ school_id: body.school_id, batch_id: oldActiveBatch.id });
            if (!oldGrades?.length) {
                return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
            }

            let newGrades = await this.gradeService.geGradeByQuery({ school_id: body.school_id, batch_id: newBatch.id });
            if (newGrades?.length) {
                return commonResponse.error(languageCode, res, "GRADES_ALREADY_CREATED", 400, {});
            }
            let newGradesToCreate = [];
            oldGrades.forEach((data) => {
                let { grade_number, description, school_id } = data;
                newGradesToCreate.push({ grade_number, description, school_id, batch_id: newBatch.id, created_by: req.user.userId });
            });
            console.log("========newGradesToCreate===========", newGradesToCreate);
            let createdGrades = await this.gradeService.createBulk(newGradesToCreate);
            console.log("🚀 ~ BatchController ~ recreateSchoolDataBasedOnActiveBatch ~ createdGrades:", createdGrades);
            if (!createdGrades) {
                return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
            }
            let fetchCreatedGrades = await this.gradeService.geGradeByQuery({ school_id: body.school_id, batch_id: newBatch.id });
            if (!fetchCreatedGrades) {
                return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
            }
            // // Step 3: Clone Division
            let oldDivision = await this.divisionService.getMultiDivisionByQuery({ school_id: body.school_id, batch_id: oldActiveBatch.id });
            if (!oldDivision?.length) {
                return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
            }
            let newDivision = await this.divisionService.getMultiDivisionByQuery({ school_id: body.school_id, batch_id: newBatch.id });
            if (newDivision?.length) {
                return commonResponse.error(languageCode, res, "DIVISION_ALREADY_CREATED", 400, {});
                //Divisions already created for new batch
            }
            let divisionToCreate = [];
            oldDivision.forEach((data) => {
                let findInRelatedGrade = oldGrades.find((grade) => String(grade.id) == String(data.grade_id));
                if (findInRelatedGrade) {
                    let matchGradeNumber = fetchCreatedGrades.find((grade) => String(grade.grade_number) == String(findInRelatedGrade.grade_number));
                    if (matchGradeNumber) {
                        divisionToCreate.push({
                            grade_id: matchGradeNumber.id,
                            name: data.name,
                            batch_id: newBatch.id,
                            school_id: body.school_id,
                            created_by: req.user.userId,
                        });
                    }
                }
            });

            if (!divisionToCreate?.length) {
                return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
            }
            let createDivision = await this.divisionService.createBulk(divisionToCreate);
            console.log("========createDivision===========", createDivision);
            if (!createDivision) {
                return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
            }

            // Step 4: Clone Subjects
            let oldSubjects = await this.subjectService.getSubjectByQuery({ school_id: body.school_id, batch_id: oldActiveBatch.id });
            console.log("🚀 ~ BatchController ~ recreateSchoolDataBasedOnActiveBatch ~ oldSubjects:", oldSubjects);
            if (!oldSubjects?.length) {
                return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
            }

            let newSubjects = await this.subjectService.getSubjectByQuery({ school_id: body.school_id, batch_id: newBatch.id });
            console.log("🚀 ~ BatchController ~ recreateSchoolDataBasedOnActiveBatch ~ newSubjects:", newSubjects);
            if (newSubjects?.length) {
                return commonResponse.error(languageCode, res, "SUBJECTS_ALREADY_CREATED", 400, {});
            }

            let newSubjectsToCreate = [];
            oldSubjects.forEach((data) => {
                let isExistOldGrade = oldGrades.find((grade) => String(grade.id) == String(data.grade_id));
                if (isExistOldGrade) {
                    let isExistNewGrade = fetchCreatedGrades.find((grade) => String(grade.grade_number) == String(isExistOldGrade.grade_number));
                    if (isExistNewGrade) {
                        newSubjectsToCreate.push({
                            batch_id: newBatch.id,
                            grade_id: isExistNewGrade.id,
                            master_subject_id: data.master_subject_id,
                            created_by: req.user.userId,
                            school_id: body.school_id,
                        });
                    }
                }
            });
            console.log("========newSubjectsToCreate===========", newSubjectsToCreate);
            if (!newSubjectsToCreate?.length) {
                return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
            }

            let createSubject = await this.subjectService.createBulk(newSubjectsToCreate);
            console.log("🚀 ~ BatchController ~ recreateSchoolDataBasedOnActiveBatch ~ createSubject:", createSubject);
            if (!createSubject) {
                return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
            }

            // Step 5: Clone Division Subject
            let oldRecords = await this.divisionSubjectService.getDivisionSubjectByQuery({ school_id: body.school_id, batch_id: oldActiveBatch.id });
            if (!oldRecords?.length) {
                return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
            }
            let newRecords = await this.divisionSubjectService.getDivisionSubjectByQuery({ school_id: body.school_id, batch_id: newBatch.id });
            if (newRecords?.length) {
                return commonResponse.error(languageCode, res, "DIVISON_SUBJECT_ALREADY_CREATED", 400, {});
            }

            let newDivisionSubjectToCreate = [];
            oldRecords.forEach((data) => {
                let isExistOldGrade = oldGrades.find((grade) => String(grade.id) == String(data.grade_id));
                if (isExistOldGrade) {
                    console.log("🚀 ~ BatchController ~ oldRecords.forEach ~ isExistOldGrade:", isExistOldGrade);
                    let isExistNewGrade = fetchCreatedGrades.find((grade) => String(grade.grade_number) == String(isExistOldGrade.grade_number));
                    if (isExistNewGrade) {
                        console.log("🚀 ~ BatchController ~ oldRecords.forEach ~ isExistNewGrade:", isExistNewGrade);
                        let isExistOldDivision = oldDivision.find(
                            (division) => String(division.id) == String(data.grade_class_id) && String(division.grade_id) == String(isExistOldGrade.id)
                        );
                        if (isExistOldDivision) {
                            console.log("🚀 ~ BatchController ~ oldRecords.forEach ~ isExistOldDivision:", isExistOldDivision);
                            let isExistNewDivision = createDivision.find(
                                (division) =>
                                    String(division.name) == String(isExistOldDivision.name && String(division.grade_id) == String(isExistNewGrade.id))
                            );
                            if (isExistNewDivision) {
                                console.log("🚀 ~ BatchController ~ oldRecords.forEach ~ isExistNewDivision:", isExistNewDivision);
                                let matchedSubject = createSubject.find((sub) => String(sub.master_subject_id) == String(data.master_subject_id));
                                if (matchedSubject) {
                                    console.log("🚀 ~ BatchController ~ oldRecords.forEach ~ matchedSubject:", matchedSubject);
                                    let oldTermId = oldTerm.find((old) => String(old.id) == String(data.term_id));
                                    if (oldTermId) {
                                        console.log("🚀 ~ BatchController ~ oldRecords.forEach ~ oldTermId:", oldTermId);
                                        let newTermId = isExistNewTerm.find((newTerm) => String(newTerm.term_name) == String(oldTermId.term_name));
                                        if (newTermId) {
                                            newDivisionSubjectToCreate.push({
                                                batch_id: newBatch.id,
                                                school_id: body.school_id,
                                                grade_id: isExistNewGrade.id,
                                                grade_class_id: isExistNewDivision.id,
                                                created_by: req.user.userId,
                                                subject_id: matchedSubject.id,
                                                master_subject_id: data.master_subject_id,
                                                term_id: newTermId.id,
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (newDivisionSubjectToCreate?.length) {
                let createDivisionSubject = await this.divisionSubjectService.createBulk(newDivisionSubjectToCreate);
                console.log("========createDivisionSubject===========", createDivisionSubject);

                if (!createDivisionSubject) {
                    return commonResponse.error(languageCode, res, "SERVER_ERROR", 400, {});
                }
            }

            return commonResponse.success(languageCode, res, "BATCH_UPDATED", 200, {});
        } catch (error) {
            console.error("Error updating batch:", error);
            return commonResponse.error(languageCode, res, "BATCH_UPDATE_FAILED", 500, {});
        }
    }
}
