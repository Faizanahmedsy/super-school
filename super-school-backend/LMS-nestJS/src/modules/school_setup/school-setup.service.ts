import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SchoolSetup } from "./school-setup.entity";
import { YearData, GradeData, GradeWithClasses, SubjectAssignmentData } from "./interfaces/setup-data.interface";
import { SetupStep } from "helper/constants";
import { InstituteService } from "../institutes/institutes.service";

@Injectable()
export class SchoolSetupService {
    constructor(
        @InjectRepository(SchoolSetup)
        private schoolSetupRepository: Repository<SchoolSetup>,
        private instituteService: InstituteService
    ) {}

    async getOrCreateSetup(admin_id: number, school_id: number): Promise<SchoolSetup> {
        let setup = await this.schoolSetupRepository.findOne({
            where: { admin_id, is_completed: false },
        });

        if (!setup) {
            setup = this.schoolSetupRepository.create({
                admin_id,
                current_step: SetupStep.CREATE_YEAR,
                school_id,
                is_completed: false,
            });
            setup = await this.schoolSetupRepository.save(setup);
        }

        return setup;
    }

    async updateSetupStep(admin_id: number, step: string, data: any, instituteId: any): Promise<SchoolSetup> {
        const setup = await this.schoolSetupRepository.findOne({
            where: { admin_id, is_completed: false },
        });

        if (!setup) {
            throw new NotFoundException("Setup not found");
        }
        setup.admin_id = admin_id;
        switch (step) {
            case SetupStep.CREATE_YEAR:
                const yearData = data as YearData;
                setup.year_data = { year: yearData.year };
                setup.batch_id = data.batch_id;
                setup.current_step = SetupStep.CREATE_GRADES;
                break;

            case SetupStep.CREATE_GRADES:
                const gradeData = data as { grades: GradeData[] };

                // Validate each grade
                for (const grade of gradeData.grades) {
                    if (!grade.grade_number || !grade.id) {
                        throw new BadRequestException("Each grade must include grade_number and id");
                    }
                }

                setup.grades_data = gradeData;
                setup.current_step = SetupStep.CREATE_CLASSES;
                break;

            case SetupStep.CREATE_CLASSES:
                const classData = data as { grades: GradeWithClasses[] };

                // Validate that grades exist in previous step
                const existingGrades = setup.grades_data?.grades || [];
                const newGrades = classData.grades;

                for (const grade of newGrades) {
                    const existingGrade = existingGrades.find((g) => g.grade_number === grade.grade_number);

                    if (!existingGrade) {
                        throw new BadRequestException(`Grade ${grade.grade_number} was not created in the previous step`);
                    }
                }

                setup.classes_data = classData;
                setup.current_step = SetupStep.ASSIGN_SUBJECTS;
                break;

            case SetupStep.ASSIGN_SUBJECTS:
                const subjectData = data as SubjectAssignmentData;

                // Validate subject assignment data
                if (!Array.isArray(subjectData.subjects)) {
                    throw new BadRequestException("Subjects must be an array");
                }

                // Validate each subject assignment
                for (const subject of subjectData.subjects) {
                    if (!subject.master_subject_id || !subject.school_id || !subject.grade_id || !subject.batch_id) {
                        throw new BadRequestException("Each subject assignment must include master_subject_id, school_id, grade_id, and batch_id");
                    }
                }

                setup.subjects_data = subjectData;
                setup.current_step = SetupStep.COMPLETED;
                setup.is_completed = true;

                let instituteInfo = await this.instituteService.getInstituteById(instituteId);
                if (instituteInfo && instituteInfo.setup == false) {
                    let id = instituteInfo.id;
                    delete instituteInfo.id;
                    let updatePayload = { ...instituteInfo, setup: true };
                    this.instituteService.updateInstitute(id, updatePayload);
                    await this.instituteService.updateInstitute(id, updatePayload);
                }
                break;
        }

        return this.schoolSetupRepository.save(setup);
    }
}
