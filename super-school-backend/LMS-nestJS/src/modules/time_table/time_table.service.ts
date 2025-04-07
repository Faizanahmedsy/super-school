import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TimeTable } from "./time_table.entity";
import { ILike, Repository } from "typeorm";
import { CreateTimeTable } from "./dto/create-time-table.dto";

@Injectable()
export class TimeTableService {
    constructor(
        @InjectRepository(TimeTable)
        private timeTableRepository: Repository<TimeTable>
    ) {}

    async isExist(query: any) {
        return await this.timeTableRepository.findOne({ where: query });
    }

    async create(body: CreateTimeTable) {
        return await this.timeTableRepository.save(body);
    }

    async updateTimetable(data: Partial<CreateTimeTable>) {
        return await this.timeTableRepository.save(data);
    }

    async detail(query: any) {
        return await this.timeTableRepository.findOne({
            where: query,
            relations: ["grade", "division", "institute", "batch", "subject", "subject.master_subject", "term"],
        });
    }

    async getList(reqQuery: any): Promise<{
        totalCount: number;
        totalPages: number;
        currentPage: number;
        list: any[];
    }> {
        const page = reqQuery.page ? parseInt(reqQuery.page, 10) : 1;
        const limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : 10;
        const offset = (page - 1) * limit;
        const sortOrder = reqQuery.sort === "desc" ? "DESC" : "ASC";

        const where: any = {
            deleted_at: null, //
        };

        if (reqQuery.search && reqQuery.search !== "undefined" && reqQuery.search !== "") {
            where.assessment_name = ILike(`%${reqQuery.search}%`);
        }

        if (reqQuery?.school_id && reqQuery.school_id != "") {
            where.school_id = reqQuery.school_id;
        }

        if (reqQuery?.batch_id && reqQuery.batch_id != "") {
            where.batch_id = reqQuery.batch_id;
        }

        if (reqQuery?.grade_id && reqQuery.grade_id != "") {
            where.grade_id = reqQuery.grade_id;
        }
        if (reqQuery?.class_id && reqQuery.class_id != "") {
            where.class_id = reqQuery.class_id;
        }
        if (reqQuery?.subject_id && reqQuery.subject_id != "") {
            where.subject_id = reqQuery.subject_id;
        }

        let [timeTable, totalCount] = await this.timeTableRepository.findAndCount({
            where,
            order: { created_at: sortOrder },
            relations: ["grade", "division", "subject", "subject.master_subject", "term"],
            skip: offset,
            take: limit,
        });

        let modifiedData = timeTable.map((data) => {
            return {
                id: data.id,
                assessment_name: data.assessment_name,
                subject_name: data?.subject?.master_subject?.subject_name || "",
                paper_title: data.paper_title,
                term_name: data.term.term_name,
                grade_number: data.grade.grade_number,
                ...(data?.class_id && { class: data.division.name }),
                start_date: data.start_date,
                end_date: data.end_date,
                start_time: data.start_time,
                end_time: data.end_time,
            };
        });

        const totalPages = Math.ceil(totalCount / limit);

        return {
            totalCount: totalCount,
            totalPages,
            currentPage: page,
            list: modifiedData,
        };
    }

    async deleteEvent(timeTable: TimeTable) {
        timeTable.deleted_at = new Date();
        await this.timeTableRepository.save(timeTable);
        return true;
    }

    async getTimeTableByQuery(query: any) {
        return await this.timeTableRepository.find({ where: query });
    }

    async bulkUpdate(data: Partial<TimeTable>[]) {
        return await this.timeTableRepository.save(data);
    }
}
