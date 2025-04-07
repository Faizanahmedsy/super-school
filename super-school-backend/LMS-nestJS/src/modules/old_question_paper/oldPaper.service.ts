import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OldQuestionPaper } from "./oldPaper.entity";
import { CreateOldQuestionPaperDto } from "../old_question_paper/dtos/create-old-question-paper.dto";
import { UpdateOldQuestionPaperDto } from "../old_question_paper/dtos/update-old-question-paper.dto";
import { Grade } from "../grade/grade.entity";
import { Batch } from "../batch/batch.entity";

@Injectable()
export class OldQuestionPaperService {
    constructor(
        @InjectRepository(OldQuestionPaper)
        private readonly oldQuestionPaperRepository: Repository<OldQuestionPaper>,
        @InjectRepository(Grade)
        private readonly gradeRepository: Repository<Grade>,
        @InjectRepository(Batch)
        private readonly batchRepository: Repository<Batch>
    ) {}

    async create(createOldQuestionPaperDto: CreateOldQuestionPaperDto, filePath: string): Promise<OldQuestionPaper> {
        const newPaper = this.oldQuestionPaperRepository.create({
            ...createOldQuestionPaperDto,
            paper_path: filePath,
        });
        return await this.oldQuestionPaperRepository.save(newPaper);
    }

    async findAll(): Promise<OldQuestionPaper[]> {
        try {
            return await this.oldQuestionPaperRepository.find({
                where: { deleted_at: null },
            });
        } catch (error) {
            throw new Error("Error fetching old question papers");
        }
    }

    async findOne(id: number): Promise<OldQuestionPaper> {
        try {
            return await this.oldQuestionPaperRepository.findOne({
                where: { id, deleted_at: null },
            });
        } catch (error) {
            throw new Error("Error fetching old question paper");
        }
    }

    async update(id: number, updateData: UpdateOldQuestionPaperDto): Promise<OldQuestionPaper> {
        const existingPaper = await this.oldQuestionPaperRepository.findOne({ where: { id } });

        if (!existingPaper) {
            return null;
        }
        Object.assign(existingPaper, updateData);

        let result = await this.oldQuestionPaperRepository.save(existingPaper);

        return result;
    }

    async softDelete(id: number): Promise<void> {
        try {
            await this.oldQuestionPaperRepository.update(
                { id },
                {
                    deleted_at: new Date(),
                    updated_at: new Date(),
                }
            );
        } catch (error) {
            throw new Error("Error during soft delete");
        }
    }

    async getGradeAndBatchInfo(gradeId: number, batchId: number): Promise<{ grade_number: string; start_year: number }> {
        const grade = await this.gradeRepository.findOne({ where: { id: gradeId } });
        if (!grade) {
            throw new NotFoundException("Grade not found");
        }

        const batch = await this.batchRepository.findOne({ where: { id: batchId } });
        if (!batch) {
            throw new NotFoundException("Batch not found");
        }

        return {
            grade_number: grade.grade_number.toString(),
            start_year: batch.start_year,
        };
    }
}
