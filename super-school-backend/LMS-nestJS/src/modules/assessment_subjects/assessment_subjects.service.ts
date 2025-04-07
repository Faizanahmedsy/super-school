import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AssessmentSubject } from "./assessment_subjects.entity";
import { CreateAssessmentSubjectDto } from "./dtos/create-assessment-subjects.dto";
import { UpdateAssessmentSubjectDto } from "./dtos/update-assessment-subjects.dto";

@Injectable()
export class AssessmentSubjectService {
    constructor(
        @InjectRepository(AssessmentSubject)
        private assessmentSubjectRepository: Repository<AssessmentSubject>
    ) {}

    async createAssessmentSubject(createAssessmentSubjectDto: CreateAssessmentSubjectDto) {
        try {
            const newAssessmentSubject = this.assessmentSubjectRepository.create({
                ...createAssessmentSubjectDto,
            } as any);
            return await this.assessmentSubjectRepository.save(newAssessmentSubject);
        } catch (error) {
            throw new InternalServerErrorException("Failed to create assessment subject");
        }
    }

    async getAssessmentSubjects(query: any): Promise<{
        totalCount: number;
        totalPages: number;
        currentPage: number;
        list: AssessmentSubject[];
    }> {
        const page = query.page ? parseInt(query.page, 10) : 1;
        const limit = query.limit ? parseInt(query.limit, 10) : 10;
        const offset = (page - 1) * limit;

        const [assessmentSubjects, totalCount] = await this.assessmentSubjectRepository.findAndCount({
            skip: offset,
            take: limit,
            order: {
                assessment_start_datetime: query.sort === "desc" ? "DESC" : "ASC",
            },
        });

        const totalPages = Math.ceil(totalCount / limit);

        return {
            totalCount,
            totalPages,
            currentPage: page,
            list: assessmentSubjects,
        };
    }

    async getAssessmentSubjectById(id: number): Promise<AssessmentSubject> {
        const assessmentSubject = await this.assessmentSubjectRepository.findOne({ where: { id } });
        if (!assessmentSubject) {
            throw new NotFoundException(`Assessment Subject with ID ${id} not found`);
        }
        return assessmentSubject;
    }

    async updateAssessmentSubject(id: number, updateAssessmentSubjectDto: UpdateAssessmentSubjectDto): Promise<AssessmentSubject> {
        const assessmentSubject = await this.getAssessmentSubjectById(id);
        Object.assign(assessmentSubject, updateAssessmentSubjectDto);
        return await this.assessmentSubjectRepository.save(assessmentSubject);
    }

    async deleteAssessmentSubject(id: number): Promise<void> {
        const assessmentSubject = await this.getAssessmentSubjectById(id);
        if (!assessmentSubject) {
            throw new NotFoundException(`Assessment Subject with ID ${id} not found`);
        }
        await this.assessmentSubjectRepository.softRemove(assessmentSubject);
    }
}
