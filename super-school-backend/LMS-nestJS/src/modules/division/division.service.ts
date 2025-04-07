import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, In, Like, Repository } from "typeorm";
import { Division } from "./division.entity";
import { CreateDivisionDto } from "./dtos/create-division.dto";
import { UpdateDivisionDto } from "./dtos/update-division.dto";
import { DivisionSubject } from "../division_subject/divisionsubject.entity";
import { Student } from "../student/student.entity";
@Injectable()
export class DivisionService {
    constructor(
        @InjectRepository(Division)
        private divisionRepository: Repository<Division>,

        @InjectRepository(DivisionSubject)
        private divisionSubjectRepository: Repository<DivisionSubject>,

        @InjectRepository(Student)
        private studentRepository: Repository<Student>
    ) {}

    async isExist(query: any) {
        return await this.divisionRepository.findOne({
            where: { ...query, deleted_at: null },
        });
    }

    async createDivision(createDivisionDto: CreateDivisionDto) {
        const newDivision = this.divisionRepository.create(createDivisionDto);
        return await this.divisionRepository.save(newDivision);
    }

    async findDivisionsByIds(divisionIds: number[]): Promise<Division[]> {
        return await this.divisionRepository.findByIds(divisionIds);
    }

    /*
     *   Get Division by Query
     */
    async getDivisions(reqQuery: any): Promise<{
        totalCount: number;
        totalPages: number;
        currentPage: number;
        list: Division[];
    }> {
        const page = reqQuery.page ? parseInt(reqQuery.page, 10) : 1;
        const limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : 10;
        const offset = (page - 1) * limit;
        const sortOrder = reqQuery.sort && reqQuery.sort.toLowerCase() === "asc" ? "ASC" : "DESC";

        const filters: any = { deleted_at: null };

        if (reqQuery.search && reqQuery.search !== "undefined" && reqQuery.search !== "") {
            filters.name = Like(`%${reqQuery.search}%`);
        }

        if (reqQuery.school_id && reqQuery.school_id !== "undefined" && reqQuery.school_id !== "") {
            filters.school_id = reqQuery.school_id;
        }

        if (reqQuery.grade_id && reqQuery.grade_id !== "undefined" && reqQuery.grade_id !== "") {
            filters.grade_id = reqQuery.grade_id;
        }

        let divisionIds: number[] | undefined;
        const checkStudent = reqQuery.checkStudent === "true";

        if (reqQuery.subject_id && reqQuery.subject_id !== "undefined" && reqQuery.subject_id !== "") {
            const subjectFilter: any = { subject_id: reqQuery.subject_id };

            if (reqQuery.grade_id && reqQuery.grade_id !== "undefined" && reqQuery.grade_id !== "") {
                subjectFilter["grade_id"] = reqQuery.grade_id;
            }

            // Find divisions where students are learning the subject
            const divisionSubjects = await this.divisionSubjectRepository.find({
                relations: checkStudent ? ["students"] : [],
                select: ["grade_class_id"],
                where: subjectFilter,
            });

            console.log("🚀 ~ file: division.service.ts:79 ~ DivisionService ~ getDivisions ~ divisionSubjects:", divisionSubjects);

            // divisionIds = [...new Set(divisionSubjects.map((ds) => ds.grade_class_id))];

            divisionIds = [
                ...new Set(divisionSubjects.filter((ds) => !checkStudent || (ds.students && ds.students.length > 0)).map((ds) => ds.grade_class_id)),
            ];

            if (divisionIds.length === 0) {
                return {
                    totalCount: 0,
                    totalPages: 0,
                    currentPage: page,
                    list: [],
                };
            }

            filters.id = In(divisionIds);
        }

        if (reqQuery.teacher_id && reqQuery.teacher_id !== "undefined" && reqQuery.teacher_id !== "") {
            const teacherFilter: any = { teacher_id: reqQuery.teacher_id };

            if (reqQuery.subject_id && reqQuery.subject_id !== "undefined" && reqQuery.subject_id !== "") {
                teacherFilter["subject_id"] = reqQuery.subject_id;
            }

            if (reqQuery.grade_id && reqQuery.grade_id !== "undefined" && reqQuery.grade_id !== "") {
                teacherFilter["grade_id"] = reqQuery.grade_id;
            }

            const classSubjects = await this.divisionSubjectRepository.find({
                select: ["grade_class_id"],
                where: teacherFilter,
            });

            const teacherDivisionIds = [...new Set(classSubjects.map((cs) => cs.grade_class_id))];

            if (teacherDivisionIds.length === 0) {
                return {
                    totalCount: 0,
                    totalPages: 0,
                    currentPage: page,
                    list: [],
                };
            }

            if (divisionIds) {
                filters.id = In(divisionIds.filter((id) => teacherDivisionIds.includes(id)));
            } else {
                filters.id = In(teacherDivisionIds);
            }
        }

        const [divisions, totalCount] = await this.divisionRepository.findAndCount({
            where: filters,
            relations: ["institute", "grades", "batch", "students"],
            order: {
                name: sortOrder as "ASC" | "DESC",
            },
            skip: reqQuery.page ? offset : undefined,
            take: reqQuery.page ? limit : undefined,
        });

        const filteredDivisions = divisions.map((division) => ({
            ...division,
            studentCount: division.students?.length || 0,
        }));

        const finalDivisions = checkStudent ? filteredDivisions.filter((division) => division.studentCount > 0) : filteredDivisions;

        const totalPages = Math.ceil((checkStudent ? finalDivisions.length : totalCount) / limit);

        return {
            totalCount: checkStudent ? finalDivisions.length : totalCount,
            totalPages,
            currentPage: page,
            list: finalDivisions,
        };
    }

    // async getDivisions(reqQuery: any): Promise<{
    //     totalCount: number;
    //     totalPages: number;
    //     currentPage: number;
    //     list: Division[];
    // }> {
    //     const page = reqQuery.page ? parseInt(reqQuery.page, 10) : 1;
    //     const limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : 10;
    //     const offset = (page - 1) * limit;
    //     const sortOrder = reqQuery.sort && reqQuery.sort.toLowerCase() === "asc" ? "ASC" : "DESC";

    //     let queryBuilder = this.divisionRepository
    //         .createQueryBuilder("division")
    //         .leftJoinAndSelect("division.institute", "institute")
    //         .leftJoinAndSelect("division.grades", "grades")
    //         .leftJoinAndSelect("division.batch", "batch")
    //         .loadRelationCountAndMap("division.studentCount", "division.students") // Map student count
    //         .where("division.deleted_at IS NULL");

    //     if (reqQuery.search && reqQuery.search !== "undefined" && reqQuery.search !== "") {
    //         queryBuilder = queryBuilder.andWhere("division.name ILIKE :search", { search: `%${reqQuery.search}%` });
    //     }

    //     if (reqQuery.school_id && reqQuery.school_id !== "undefined" && reqQuery.school_id !== "") {
    //         queryBuilder = queryBuilder.andWhere("division.school_id = :school_id", { school_id: reqQuery.school_id });
    //     }

    //     if (reqQuery.grade_id && reqQuery.grade_id !== "undefined" && reqQuery.grade_id !== "") {
    //         queryBuilder = queryBuilder.andWhere("division.grade_id = :grade_id", { grade_id: reqQuery.grade_id });
    //     }

    //     let divisionIds: number[] | undefined;
    //     if (reqQuery.teacher_id && reqQuery.teacher_id !== "undefined" && reqQuery.teacher_id !== "") {
    //         const filter: any = { teacher_id: reqQuery.teacher_id };

    //         if (reqQuery.subject_id && reqQuery.subject_id !== "undefined" && reqQuery.subject_id !== "") {
    //             filter["subject_id"] = reqQuery.subject_id;
    //         }

    //         if (reqQuery.grade_id && reqQuery.grade_id !== "undefined" && reqQuery.grade_id !== "") {
    //             filter["grade_id"] = reqQuery.grade_id;
    //         }

    //         // Fetch term IDs where teacher_id matches
    //         const classSubjects = await this.divisionSubjectRepository.find({
    //             select: ["grade_class_id"], // Select only term IDs
    //             where: filter,
    //         });
    //         divisionIds = [...new Set(classSubjects.map((cs) => cs.grade_class_id))];
    //     }

    //     if (divisionIds && divisionIds.length > 0) {
    //         queryBuilder = queryBuilder.andWhere("division.id IN (:...ids)", { ids: divisionIds });
    //     } else if (reqQuery.teacher_id) {
    //         // If no divisions match the teacher_id, return an empty result
    //         return {
    //             totalCount: 0,
    //             totalPages: 0,
    //             currentPage: page,
    //             list: [],
    //         };
    //     }

    //     const checkStudent = reqQuery.checkStudent === "true";

    //     const [divisions, totalCount] = await queryBuilder
    //         .orderBy("division.created_at", sortOrder)
    //         .skip(reqQuery.page ? offset : null)
    //         .take(reqQuery.page ? limit : null)
    //         .getManyAndCount();

    //     const filteredDivisions = divisions.map((division) => ({
    //         ...division,
    //         studentCount: division["studentCount"] || 0, // Ensure student count defaults to 0
    //     }));

    //     // Filter based on checkStudent
    //     const finalDivisions = checkStudent ? filteredDivisions.filter((division) => division.studentCount > 0) : filteredDivisions;

    //     const totalPages = Math.ceil((checkStudent ? finalDivisions.length : totalCount) / limit);

    //     return {
    //         totalCount: checkStudent ? finalDivisions.length : totalCount,
    //         totalPages,
    //         currentPage: page,
    //         list: finalDivisions,
    //     };
    // }

    async getDivisionById(id: number) {
        return await this.divisionRepository.findOne({ where: { id } });
    }
    async getDivisionByQuery(query: any) {
        return await this.divisionRepository.findOne({ where: query });
    }
    async updateDivision(id: number, updateDivisionDto: UpdateDivisionDto) {
        const division = await this.getDivisionById(id);
        if (!division) {
            throw new NotFoundException(`Division with ID ${id} not found`);
        }
        Object.assign(division, updateDivisionDto);
        return await this.divisionRepository.save(division);
    }

    async deleteDivision(data: Partial<Division>) {
        await this.divisionRepository.save(data);
    }

    async prepareDivisionData(oldDivisions: Division[], newBatchId: number): Promise<Partial<Division>[]> {
        return oldDivisions.map((division) => ({
            ...division, // Copy all properties
            batch_id: newBatchId, // Update the batch_id
            created_at: new Date(), // Reset timestamps
            updated_at: new Date(),
        }));
    }

    async createBulk(newDivisions: Partial<Division>[]) {
        console.log("🚀 🚀 <<<<<< createBulk Data >>>>>>", newDivisions);
        const savedDivisions = await this.divisionRepository.save(newDivisions);
        return savedDivisions;
    }

    async getDivisionByBatchId(batchId: number) {
        console.log(`Fetching division for batch with ID: ${batchId}`);

        try {
            console.log("About to query divisionRepository...");
            const division = await this.divisionRepository.find({
                where: { batch_id: batchId },
            });

            console.log("Query executed successfully. Divisions fetched:", division);

            if (!division.length) {
                console.warn(`No division found for batch ID: ${batchId}`);
                return [];
            }

            return division;
        } catch (error) {
            console.error("Error fetching divisions:", error);
            throw new Error("Failed to fetch divisions");
        }
    }

    async isExistCheckWithQuery(query: any) {
        return await this.divisionSubjectRepository.findOne({ where: query });
    }

    async isExistStudent(query: any) {
        return await this.studentRepository.findOne({ where: query });
    }
    async getMultiDivisionByQuery(query: any) {
        return await this.divisionRepository.find({ where: query });
    }

    async hardDeleteDivision(divisionIdsArray: number[]) {
        await this.divisionRepository.delete(divisionIdsArray);
    }

    async bulkUpdate(data: Partial<Division>[]) {
        await this.divisionRepository.save(data);
    }
}
