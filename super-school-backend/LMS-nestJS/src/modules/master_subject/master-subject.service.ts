import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, ILike } from "typeorm";
import { MasterSubject } from "./master-subject.entity";
import { CreateMasterSubjectDto } from "../master_subject/dtos/create-master-subject.dto";
import { UpdateMasterSubjectDto } from "../master_subject/dtos/update-master-subject.dto";
const isValidQueryValue = (value: any) => value && value !== "undefined" && value !== "";
@Injectable()
export class MasterSubjectService {
    constructor(
        @InjectRepository(MasterSubject)
        private masterSubjectRepository: Repository<MasterSubject>
    ) {}

    async createMasterSubject(createMasterSubjectDto: CreateMasterSubjectDto) {
        const newSubject = this.masterSubjectRepository.create(createMasterSubjectDto);
        return await this.masterSubjectRepository.save(newSubject);
    }

    async findSubjectByName(query: unknown): Promise<MasterSubject | null> {
        return this.masterSubjectRepository.findOne({ where: query });
    }

    async getMasterSubjects(reqQuery: any) {
        const page = reqQuery.page ? parseInt(reqQuery.page, 10) : 1;
        const limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : 10;
        const offset = (page - 1) * limit;
        const sortDirection = reqQuery.sort && reqQuery.sort.toLowerCase() === "desc" ? "DESC" : "ASC";
        let queryObject: any[] = [{ deleted_at: null }];

        if (isValidQueryValue(reqQuery?.search)) {
            const searchCondition = ILike(`%${reqQuery.search}%`);
            queryObject = [
                { deleted_at: null, subject_name: searchCondition },
                { deleted_at: null, subject_code: searchCondition },
            ];
        }

        if (isValidQueryValue(reqQuery?.is_language)) {
            queryObject = queryObject.map((q) => ({
                ...q,
                is_language: reqQuery.is_language,
            }));
        }
        if (isValidQueryValue(reqQuery?.grade_number)) {
            queryObject = queryObject.map((q) => ({
                ...q,
                grade_number: reqQuery.grade_number,
            }));
        }

        let sortBy = "subject_name"; // Default sorting based on subjectName
        if (reqQuery?.sortBy) {
            sortBy = reqQuery.sortBy;
        }

        const [subjects, totalCount] = await this.masterSubjectRepository.findAndCount({
            where: queryObject,
            order: { [sortBy]: sortDirection },
            skip: reqQuery.page ? offset : null,
            take: reqQuery.page ? limit : null,
        });
        if (!reqQuery?.grade_number) {
            subjects.sort((a, b) => parseInt(a.grade_number, 10) - parseInt(b.grade_number, 10));
        }

        const totalPages = Math.ceil(totalCount / limit);

        return {
            totalCount,
            totalPages,
            currentPage: page,
            list: subjects,
        };
    }

    async getMasterSubjectById(id: number) {
        const subject = await this.masterSubjectRepository.findOne({ where: { id } });
        if (!subject) {
            throw new NotFoundException(`Subject with ID ${id} not found`);
        }
        return subject;
    }
    async isExist(id: number): Promise<MasterSubject | null> {
        return await this.masterSubjectRepository.findOne({ where: { id } });
    }

    async updateMasterSubject(id: number, updateMasterSubjectDto: UpdateMasterSubjectDto) {
        const subject = await this.getMasterSubjectById(id);
        Object.assign(subject, updateMasterSubjectDto);
        return await this.masterSubjectRepository.save(subject);
    }

    async deleteMasterSubject(id: number): Promise<void> {
        const subject = await this.masterSubjectRepository.findOne({ where: { id } });
        if (!subject) {
            throw new NotFoundException(`Subject with ID ${id} not found`);
        }

        subject.deleted_at = new Date();
        await this.masterSubjectRepository.save(subject);
    }

    async fetchAllRecords(query: any): Promise<MasterSubject[] | null> {
        return await this.masterSubjectRepository.find({ where: query });
    }

    async bulkInsertOrUpdate(data: MasterSubject[]) {
        return await this.masterSubjectRepository.save(data);
    }

    async updateMasterForImport(id: number, updateMasterSubjectDto: UpdateMasterSubjectDto) {
        return await this.masterSubjectRepository.save(updateMasterSubjectDto);
    }
}
