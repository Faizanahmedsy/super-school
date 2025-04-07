import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { StudentAnswerSheet } from "./student_answer_sheet.entity";
import { CreateStudentAnswerSheetDto } from "./dtos/create-student-answer-sheet.dto";
import { UpdateStudentAnswerSheetDto } from "./dtos/updtae-student-answer-sheet.dto";

@Injectable()
export class StudentAnswerSheetService {
    constructor(
        @InjectRepository(StudentAnswerSheet)
        private studentAnswerSheetRepository: Repository<StudentAnswerSheet>
    ) {}

    async createStudentAnswerSheet(createStudentAnswerSheetDto: CreateStudentAnswerSheetDto) {
        try {
            const newStudentAnswerSheet = this.studentAnswerSheetRepository.create({
                ...createStudentAnswerSheetDto,
            } as any);
            return await this.studentAnswerSheetRepository.save(newStudentAnswerSheet);
        } catch (error) {
            throw new InternalServerErrorException("Failed to create student answer sheet");
        }
    }

    async getStudentAnswerSheets(query: any): Promise<{
        totalCount: number;
        totalPages: number;
        currentPage: number;
        list: StudentAnswerSheet[];
    }> {
        const page = query.page ? parseInt(query.page, 10) : 1;
        const limit = query.limit ? parseInt(query.limit, 10) : 10;
        const offset = (page - 1) * limit;

        const sortDirection = query.sort === "desc" ? "DESC" : "ASC";  // Default sorting direction

        const [studentAnswerSheets, totalCount] = await this.studentAnswerSheetRepository.findAndCount({
            skip: offset,
            take: limit,
            order: {
                id: sortDirection,  // Sorting by id by default
            },
        });

        const totalPages = Math.ceil(totalCount / limit);

        return {
            totalCount,
            totalPages,
            currentPage: page,
            list: studentAnswerSheets,
        };
    }

    async getStudentAnswerSheetById(id: number): Promise<StudentAnswerSheet> {
        const studentAnswerSheet = await this.studentAnswerSheetRepository.findOne({ where: { id } });
        if (!studentAnswerSheet) {
            throw new NotFoundException(`Student Answer Sheet with ID ${id} not found`);
        }
        return studentAnswerSheet;
    }

    async updateStudentAnswerSheet(id: number, updateStudentAnswerSheetDto: UpdateStudentAnswerSheetDto): Promise<StudentAnswerSheet> {
        const studentAnswerSheet = await this.getStudentAnswerSheetById(id);
        Object.assign(studentAnswerSheet, updateStudentAnswerSheetDto);
        return await this.studentAnswerSheetRepository.save(studentAnswerSheet);
    }

    async deleteStudentAnswerSheet(id: number): Promise<void> {
        const studentAnswerSheet = await this.getStudentAnswerSheetById(id);
        if (!studentAnswerSheet) {
            throw new NotFoundException(`Student Answer Sheet with ID ${id} not found`);
        }
        await this.studentAnswerSheetRepository.remove(studentAnswerSheet);
    }
}
