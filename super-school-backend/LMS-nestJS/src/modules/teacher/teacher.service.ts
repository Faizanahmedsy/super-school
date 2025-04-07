import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, In, Raw, Repository } from "typeorm";
import { Teacher } from "./teacher.entity";
import { CreateTeacherDto } from "./dtos/create-teacher.dto";
import { UpdateTeacherDto } from "./dtos/update-teacher.dto";
import { DivisionService } from "../division/division.service"; // Import DivisionService
import { GetTeachersDto } from "./dtos/get-teachers.dto";
import { DataSource } from "typeorm";
import { DivisionSubject } from "../division_subject/divisionsubject.entity";
import { Subject } from "../subject/subject.entity"; // Import related entities if needed
import { Division } from "../division/division.entity";
import { SubjectService } from "../subject/subject.service";
import { NotificationService } from "../notification/notification.service";
import { DivisionSubjectService } from "../division_subject/divisionsubject.service";
import { MasterSubjectService } from "../master_subject/master-subject.service";

@Injectable()
export class TeacherService {
    constructor(
        @InjectRepository(Teacher)
        private teacherRepository: Repository<Teacher>,
        // @InjectRepository(DivisionSubject)
        // private divisionSubjectRepository: Repository<DivisionSubject>,
        private divisionSubjectService: DivisionSubjectService,
        private masterSubjectService: MasterSubjectService
    ) {}

    async isExist(query: { email?: string; school_id?: number; name?: string; id?: number }): Promise<Teacher | undefined> {
        return await this.teacherRepository.findOne({ where: query });
    }

    async createTeacher(createTeacherDto: CreateTeacherDto) {
        const newTeacher = this.teacherRepository.create(createTeacherDto);

        return await this.teacherRepository.save(newTeacher);
    }

    // async createTeacher(createTeacherDto: CreateTeacherDto) {
    //     // Create a new teacher entity from the DTO
    //     const newTeacher = this.teacherRepository.create(createTeacherDto);

    //     // Save the new teacher to the database
    //     const savedTeacher = await this.teacherRepository.save(newTeacher);

    //     // Create and send the notification after the teacher is saved
    //     await this.notificationService.createNotification({
    //         title: `New teacher created: ${savedTeacher.first_name} ${savedTeacher.last_name}`,
    //         message: `New teacher: ${savedTeacher.first_name} ${savedTeacher.last_name} has been created.`,
    //         school_id: savedTeacher.school_id,
    //         created_by: savedTeacher.created_by,
    //     });

    //     // Return the saved teacher as a response
    //     return savedTeacher;
    // }

    // async getTeachers(query: any): Promise<{
    //     totalCount: number;
    //     totalPages: number;
    //     currentPage: number;
    //     list: Teacher[];
    // }> {
    //     const page = query.page ? parseInt(query.page, 10) : 1;
    //     const limit = query.limit ? parseInt(query.limit, 10) : 10;
    //     const offset = (page - 1) * limit;
    //     const sortField = query.sortField || "created_at";
    //     const sortDirection = query.sort && query.sort.toLowerCase() === "desc" ? "DESC" : "ASC";
    //     let queryObject = [];
    //     if (query?.search?.trim() && query.search !== "undefined") {
    //         const searchTerm = `%${query.search.trim()}%`;
    //         queryObject.push({ first_name: ILike(searchTerm) }, { last_name: ILike(searchTerm) });
    //     }

    //     if (query?.school_id?.trim() && query.school_id !== "undefined") {
    //         const schoolIdCondition = { school_id: query.school_id };

    //         if (queryObject.length) {
    //             queryObject = queryObject.map((condition) => ({ ...condition, ...schoolIdCondition }));
    //         } else {
    //             queryObject = [schoolIdCondition];
    //         }
    //     }
    //     if (query?.batch_id?.trim() && query.batch_id !== "undefined") {
    //         const batchIdCondition = {
    //             "divisionSubjects.batch_id": query.batch_id,
    //         };

    //         if (queryObject.length) {
    //             queryObject = queryObject.map((condition) => ({ ...condition, ...batchIdCondition }));
    //         } else {
    //             queryObject = [batchIdCondition];
    //         }
    //     }

    //     //

    //     const [Teacher, totalCount] = await this.teacherRepository.findAndCount({
    //         where: queryObject,
    //         relations: ["institute", "divisionSubjects", "divisionSubjects.division", "divisionSubjects.grade"],
    //         select: {
    //             institute: {
    //                 id: true,
    //                 school_name: true,
    //             },
    //         },
    //         order: {
    //             [sortField]: sortDirection,
    //         },
    //         skip: query.page ? offset : null,
    //         take: query.page ? limit : null,
    //     });

    //     const totalPages = Math.ceil(totalCount / limit);
    //     Teacher.forEach((teacher) => {
    //         let divisionSubjects = [];
    //         teacher.divisionSubjects.forEach((single) => {
    //             let checkExist = divisionSubjects.find((k) => k.division.id == single?.division?.id);
    //             if (!checkExist) {
    //                 divisionSubjects.push(single);
    //             }
    //         });
    //         teacher.divisionSubjects = divisionSubjects;
    //     });

    //     return {
    //         totalCount,
    //         totalPages,
    //         currentPage: page,
    //         list: Teacher,
    //     };
    // }

    async getTeachers(query: any): Promise<{
        totalCount: number;
        totalPages: number;
        currentPage: number;
        list: Teacher[];
    }> {
        console.log("queryqueryquery", query);
        const page = query.page ? parseInt(query.page, 10) : 1;
        const limit = query.limit ? parseInt(query.limit, 10) : 10;
        const offset = (page - 1) * limit;
        const sortField = query.sortField || "created_at";
        const sortDirection = query.sort?.toLowerCase() === "desc" ? "DESC" : "ASC";

        const queryBuilder = this.teacherRepository
            .createQueryBuilder("teacher")
            .leftJoinAndSelect("teacher.institute", "institute")
            .leftJoinAndSelect("institute.city", "city")
            .leftJoinAndSelect("institute.state", "state")
            .leftJoinAndSelect("teacher.divisionSubjects", "divisionSubject")
            .leftJoinAndSelect("divisionSubject.division", "division")
            .leftJoinAndSelect("divisionSubject.grade", "grade")
            .leftJoinAndSelect("divisionSubject.master_subject", "master_subject")

            .orderBy(`teacher.${sortField}`, sortDirection)
            .skip(offset)
            .take(limit);

        // Search by first_name or last_name
        if (query?.search?.trim() && query.search !== "undefined") {
            const searchTerm = `%${query.search.trim()}%`;
            queryBuilder.andWhere("(teacher.first_name ILIKE :search OR teacher.last_name ILIKE :search)", { search: searchTerm });
        }

        // // Filter by school_id
        // if (query?.school_id?.trim() && query.school_id !== "undefined") {
        //     console.log("query.school_id", query.school_id);
        //     queryBuilder.andWhere("teacher.school_id = :school_id", {
        //         school_id: Number(query.school_id),
        //     });
        // }
        // console.log("queryBuilder", queryBuilder);
        // Filter by batch_id (relation property)
        if (query?.batch_id?.trim() && query.batch_id !== "undefined") {
            queryBuilder.andWhere("teacher.school_id = :school_id AND (divisionSubject.batch_id = :batch_id OR divisionSubject.batch_id IS NULL)", {
                school_id: Number(query.school_id),
                batch_id: query.batch_id,
            });
        }

        if (query?.school_id && query?.school_id != "") {
            queryBuilder.andWhere("teacher.school_id = :school_id", {
                school_id: Number(query.school_id),
            });
        }
        // Execute the query

        const [teachers, totalCount] = await queryBuilder.getManyAndCount();
        // Deduplicate divisionSubjects for each teacher
        teachers.forEach((teacher) => {
            const uniqueDivisionSubjects = new Map();
            const uniqueSubjectNames = new Set();

            teacher.divisionSubjects.forEach((subject) => {
                uniqueDivisionSubjects.set(subject.division.id, subject);
                uniqueSubjectNames.add(subject.master_subject.subject_name);
            });

            teacher.divisionSubjects = Array.from(uniqueDivisionSubjects.values());
            teacher["masterSubjectIds"] = Array.from(uniqueSubjectNames).sort(); // Sort in ascending order
        });

        const totalPages = Math.ceil(totalCount / limit);

        return {
            totalCount,
            totalPages,
            currentPage: page,
            list: teachers,
        };
    }

    async getTeacherById(id: number) {
        const teacher = await this.teacherRepository.findOne({
            where: { id },
            relations: [
                "institute.city", // Include city relation
                "institute.state",
            ],
        });
        if (!teacher) {
            throw new Error("teacher not found");
        }
        return {
            ...teacher,
            institute: {
                ...teacher.institute, // Spread existing institute properties
                city: teacher.institute?.city || null, // Include city object
                state: teacher.institute?.state || null, // Include state object
            },
        };
    }
    async getTeacherByObj(obj: any) {
        let teacherDetails = await this.teacherRepository.findOne({ where: obj });
        if (!teacherDetails) {
            return null;
        }
        if (teacherDetails.cur_batch_id) {
            let response = await this.divisionSubjectService.findAll({ teacher_id: teacherDetails.id, batch_id: teacherDetails.cur_batch_id });

            if (response && response.list) {
                teacherDetails["divisionSubjects"] = response.list;
            }
        } else {
            teacherDetails["divisionSubjects"] = [];
        }
        return teacherDetails;
    }
    async updateTeacher(id: number, updateTeacherDto: UpdateTeacherDto) {
        ``;
        const teacher = await this.getTeacherById(id);
        Object.assign(teacher, updateTeacherDto);
        return await this.teacherRepository.save(teacher);
    }
    async updateCurBatchTeacher(id: number, updateTeacherDto: unknown) {
        const teacher = await this.getTeacherById(id);
        Object.assign(teacher, updateTeacherDto);
        return await this.teacherRepository.save(teacher);
    }

    async deleteTeacher(id: number) {
        const teacher = await this.getTeacherById(id);
        if (!teacher) {
            throw new NotFoundException(`Teacher with ID ${id} not found`);
        }

        teacher.deleted_at = new Date();

        return await this.teacherRepository.save(teacher);
    }

    async getTeachersByBatchId(batchId: number): Promise<Teacher[]> {
        return this.teacherRepository.find({ where: { cur_batch_id: batchId } });
    }

    async updateTeacherBatchId(teacherId: number, batchId: number): Promise<void> {
        await this.teacherRepository.update(teacherId, { cur_batch_id: batchId });
    }

    async getTeacherSubjects(teacherId: number): Promise<Subject[]> {
        const divisionSubjects = await this.divisionSubjectService.customFindBuQuery({
            where: { teacher_id: teacherId },
            relations: ["subject"], // Fetch related subject
        });

        // Map to get the subjects only
        const subjects = divisionSubjects.map((divisionSubject) => divisionSubject.subject);
        return subjects;
    }

    async updateBatchIdForTeachers(teacherIds: string[], newBatchId: string): Promise<void> {
        let response = await this.teacherRepository.update({ id: In(teacherIds) }, { cur_batch_id: Number(newBatchId) });
        console.log("teacherResponseasdasdadad", response);
    }

    async getTeacherForEvent(obj: any) {
        return await this.teacherRepository.find({
            select: ["teacher_user_id"],
            where: obj,
        });
    }
    async getTeacherByQuery(obj: any) {
        return await this.teacherRepository.findOne({ where: obj });
    }

    async getTeacherCountBySchool(schoolId: number) {
        return await this.teacherRepository.count({ where: { school_id: schoolId } });
    }
}
