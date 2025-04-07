import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, ILike } from "typeorm";
import { Assessment } from "./assessment.entity";
import { CreateAssessmentDto } from "./dtos/create-assessment.dto";
import { UpdateAssessmentDto } from "./dtos/update-assessment.dto";

@Injectable()
export class AssessmentService {
    constructor(
        @InjectRepository(Assessment)
        private assessmentRepository: Repository<Assessment>
    ) {}

    async createAssessment(createAssessmentDto: CreateAssessmentDto) {
        try {
            const newAssessment = this.assessmentRepository.create({
                ...createAssessmentDto,
                institute: { id: createAssessmentDto.institute_id },
            } as any);
            return await this.assessmentRepository.save(newAssessment);
        } catch (error) {
            throw new InternalServerErrorException("Failed to create assessment");
        }
    }

    async getAssessments(query: any): Promise<{
        totalCount: number;
        totalPages: number;
        currentPage: number;
        list: Assessment[];
    }> {
        const page = query.page ? parseInt(query.page, 10) : 1;
        const limit = query.limit ? parseInt(query.limit, 10) : 10;
        const offset = (page - 1) * limit;

        const [assessments, totalCount] = await this.assessmentRepository.findAndCount({
            where: {
                assessment_name: query.search ? ILike(`%${query.search}%`) : undefined,
            },
            order: {
                created_at: query.sort === "desc" ? "DESC" : "ASC",
            },
            skip: offset,
            take: limit,
        });

        const totalPages = Math.ceil(totalCount / limit);

        return {
            totalCount,
            totalPages,
            currentPage: page,
            list: assessments,
        };
    }

    async getAssessmentById(id: number): Promise<Assessment> {
        const assessment = await this.assessmentRepository.findOne({ where: { id } });
        if (!assessment) {
            throw new NotFoundException(`Assessment with ID ${id} not found`);
        }
        return assessment;
    }

    async updateAssessment(id: number, updateAssessmentDto: UpdateAssessmentDto): Promise<Assessment> {
        const assessment = await this.getAssessmentById(id);
        Object.assign(assessment, updateAssessmentDto);
        return await this.assessmentRepository.save(assessment);
    }

    async deleteAssessment(id: number): Promise<void> {
        const assessment = await this.getAssessmentById(id);
        if (!assessment) {
            throw new NotFoundException(`Assessment with ID ${id} not found`);
        }
        await this.assessmentRepository.softRemove(assessment);
    }
}
