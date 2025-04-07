import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";
import { Exam } from "./exam.entity";
import { CreateExamDto } from "./dtos/create-exam.dto";
import { UpdateExamDto } from "./dtos/update-exam.dto";

@Injectable()
export class ExamService {
    constructor(
        @InjectRepository(Exam)
        private examRepository: Repository<Exam>
    ) {}

    async isExist(exam_name: string, division_id: number) {
        return await this.examRepository.findOne({
            where: {
                exam_name: exam_name,
                division_id: division_id,
            },
        });
    }

    async createExam(createExamDto: CreateExamDto) {
        const newExam = this.examRepository.create(createExamDto);
        return await this.examRepository.save(newExam);
    }

    async getExams(reqQuery: any): Promise<{
        totalCount: number;
        totalPages: number;
        currentPage: number;
        list: Exam[];
    }> {
        const page = reqQuery.page ? parseInt(reqQuery.page, 10) : 1;
        const limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : 10;

        const offset = (page - 1) * limit;

        const sortField = reqQuery.sortField || "created_at";
        const sortDirection = reqQuery.sort && reqQuery.sort.toLowerCase() === "desc" ? "DESC" : "ASC";

        let queryObject = {};
        if (reqQuery && reqQuery.exam_name && reqQuery.exam_name != "undefined" && reqQuery.exam_name != "") {
            queryObject["exam_name"] = ILike(`%${reqQuery.exam_name}%`);
        }
        if (reqQuery && reqQuery.division_id && reqQuery.division_id != "undefined" && reqQuery.division_id != "") {
            queryObject["division_id"] = reqQuery.division_id;
        }
        if (reqQuery && reqQuery.grade_id && reqQuery.grade_id != "undefined" && reqQuery.grade_id != "") {
            queryObject["grade_id"] = reqQuery.grade_id;
        }
        if (reqQuery && reqQuery.batch_id && reqQuery.batch_id != "undefined" && reqQuery.batch_id != "") {
            queryObject["batch_id"] = reqQuery.batch_id;
        }

        const [Exam, totalCount] = await this.examRepository.findAndCount({
            where: queryObject,
            relations: ["division", "grade", "batch"],
            order: {
                [sortField]: sortDirection,
            },
            select: {
                division: {
                    id: true,
                    name: true,
                },
                grade: {
                    id: true,
                },
            },
            skip: offset,
            take: limit,
        });

        const totalPages = Math.ceil(totalCount / limit);

        return {
            totalCount,
            totalPages,
            currentPage: page,
            list: Exam,
        };
    }

    async getExamById(id: number) {
        const exam = await this.examRepository.findOne({ where: { id } });
        if (!exam) {
            throw new NotFoundException(`Exam with ID ${id} not found`);
        }
        return exam;
    }

    async updateExam(id: number, updateExamDto: UpdateExamDto) {
        const exam = await this.getExamById(id);
        Object.assign(exam, updateExamDto);
        return await this.examRepository.save(exam);
    }

    async deleteExam(id: number) {
        const exam = await this.getExamById(id);
        await this.examRepository.remove(exam);
    }
}
