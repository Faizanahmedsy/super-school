import { forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { UpdateDivisionSubjectDto } from "./dtos/update-divisionsubject.dto";
import { DivisionSubject } from "./divisionsubject.entity";
import { CreateDivisionSubjectDto } from "./dtos/create-divisionsubject.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Not, Repository } from "typeorm";
import { TeacherService } from "../teacher/teacher.service";
import { LearnerTeacherListDto } from "./dtos/learner-teacher-list.dto";
import { GradeService } from "../grade/grade.service";
import { StudentService } from "../student/student.service";
import { number } from "joi";
interface SubjectTeacher {
    school_id: number;
    batch_id: number;
    term_id: number;
    grade_id: number;
    grade_class_id: number;
    subject_id: number;
    master_subject_id: number;
    teacher_id: number;
    created_by: number;
}

interface Subject {
    subject_id: number;
    master_subject?: {
        subject_name: string;
    };
    [key: string]: any; // Include any other properties as needed
}

const isValidQueryValue = (value: any) => value && value !== "undefined" && value !== "";
@Injectable()
export class DivisionSubjectService {
    constructor(
        @InjectRepository(DivisionSubject)
        private divisionSubjectRepository: Repository<DivisionSubject>,

        @Inject(forwardRef(() => TeacherService))
        private teacherService: TeacherService,

        @Inject(forwardRef(() => StudentService))
        private studentService: StudentService
    ) {}

    async create(createDivisionSubjectDto: CreateDivisionSubjectDto) {
        const newDivisionSubject = this.divisionSubjectRepository.create(createDivisionSubjectDto);
        return await this.divisionSubjectRepository.save(newDivisionSubject);
    }
    async isExist(id: number): Promise<DivisionSubject | null> {
        return await this.divisionSubjectRepository.findOne({ where: { id } });
    }
    async isExistCheckWithQuery(query: any): Promise<DivisionSubject | null> {
        return await this.divisionSubjectRepository.findOne({ where: query });
    }
    async addSubjectToTeacher(diviSionSubjects: SubjectTeacher[]) {
        const divisionSubjects = diviSionSubjects.map((oneSubject) => {
            return this.divisionSubjectRepository.create(oneSubject);
        });
        let newDivisionSubjects = await this.divisionSubjectRepository.save(divisionSubjects);
        this.teacherService.updateCurBatchTeacher(diviSionSubjects[0].teacher_id, { cur_batch_id: diviSionSubjects[0].batch_id });
        return newDivisionSubjects;
    }
    async addSubjectToDivision(grade_class_id: number, subjectId: number, batchId: number) {
        const newDivisionSubject = this.divisionSubjectRepository.create({
            grade_class_id: grade_class_id,
            subject_id: subjectId,
            batch_id: batchId,
        });
        await this.divisionSubjectRepository.save(newDivisionSubject);
    }

    async findAll(reqQuery?: any) {
        const page = reqQuery.page ? parseInt(reqQuery.page, 10) : 1;
        const limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : 10;
        const offset = (page - 1) * limit;
        const sortDirection = reqQuery.sort && reqQuery.sort.toLowerCase() === "desc" ? "DESC" : "ASC";
        const sortColumn = reqQuery.sortBy ? reqQuery.sortBy : "created_at"; // Default sort column

        let queryObject: Record<string, any> = {};
        if (isValidQueryValue(reqQuery.grade_id)) {
            queryObject["grade_id"] = reqQuery.grade_id;
        }
        if (isValidQueryValue(reqQuery.grade_class_id)) {
            queryObject["grade_class_id"] = reqQuery.grade_class_id;
        }
        if (isValidQueryValue(reqQuery.master_subject_id)) {
            queryObject["master_subject_id"] = reqQuery.master_subject_id;
        }
        if (isValidQueryValue(reqQuery.teacher_id)) {
            queryObject["teacher_id"] = reqQuery.teacher_id;
        }
        if (isValidQueryValue(reqQuery.term_id)) {
            queryObject["term_id"] = reqQuery.term_id;
        }
        if (isValidQueryValue(reqQuery.batch_id)) {
            queryObject["batch_id"] = reqQuery.batch_id;
        }
        if (isValidQueryValue(reqQuery.subject_id)) {
            queryObject["subject_id"] = reqQuery.subject_id;
        }
        if (isValidQueryValue(reqQuery.school_id)) {
            queryObject["school_id"] = reqQuery.school_id;
        }

        console.log("queryObject--------", queryObject);
        // Fetch all records (necessary for deduplication)
        const [subjects] = await this.divisionSubjectRepository.findAndCount({
            where: queryObject,
            relations: ["teacher", "grade", "master_subject", "term", "batch", "division", "subject", "students"],
            order: {
                [sortColumn]: sortDirection,
            },
        });

        // Deduplicate by subject_id
        let response: DivisionSubject[];

        if (queryObject?.master_subject_id && queryObject?.master_subject_id != "") {
            response = Object.values(
                (subjects as DivisionSubject[]).reduce((acc: Record<number, DivisionSubject>, subject) => {
                    const teacherId = subject.teacher_id; // Assuming `subject_id` is the key for deduplication
                    if (!acc[teacherId]) {
                        acc[teacherId] = subject; // Keep the first occurrence
                    }
                    return acc;
                }, {})
            );
        } else {
            response = Object.values(
                (subjects as DivisionSubject[]).reduce((acc: Record<string, DivisionSubject>, subject) => {
                    let uniqueKey: string | number = subject.subject_id;
                    if (queryObject.teacher_id) {
                        uniqueKey = `${subject.subject_id}_${subject.grade_id}_${subject.grade_class_id}`;
                    }

                    const hasStudents = subject.students && subject.students.length > 0;

                    if (!acc[uniqueKey]) {
                        acc[uniqueKey] = subject;
                    } else {
                        const existingHasStudents = acc[uniqueKey].students && acc[uniqueKey].students.length > 0;
                        if (!existingHasStudents && hasStudents) {
                            acc[uniqueKey] = subject;
                        }
                    }

                    return acc;
                }, {})
            );
        }

        if (reqQuery.forTeacher) {
            return {
                totalCount: 0,
                totalPages: 0,
                currentPage: 0,
                list: response,
            };
        }
        let uniqueSubjects =
            // Sort the unique subjects
            response.sort((a, b) => {
                const nameA = a.master_subject?.subject_name?.toLowerCase() || "";
                const nameB = b.master_subject?.subject_name?.toLowerCase() || "";
                return nameA.localeCompare(nameB); // Ascending order
            });
        if (reqQuery.forTeacher) {
            return {
                totalCount: 0,
                totalPages: 0,
                currentPage: 0,
                list: uniqueSubjects,
            };
        }
        let checkStudent = reqQuery.checkStudent === "false";
        if (reqQuery?.checkStudent && reqQuery?.checkStudent != "") {
            checkStudent = reqQuery?.checkStudent;
        }

        if (checkStudent && (checkStudent == true || checkStudent == "true")) {
            uniqueSubjects = uniqueSubjects.filter((data) => {
                if (data?.students?.length) {
                    return data;
                }
            });
        }
        // Paginate the unique subjects
        const paginatedSubjects = uniqueSubjects.slice(offset, offset + limit);
        const totalCount = uniqueSubjects.length;
        const totalPages = Math.ceil(totalCount / limit);

        return {
            totalCount,
            totalPages,
            currentPage: page,
            list: paginatedSubjects,
        };
    }

    async findById(id: number): Promise<DivisionSubject> {
        const divisionSubject = await this.divisionSubjectRepository.findOne({
            where: { id },
            relations: ["teacher", "grade", "master_subject", "term", "batch", "division", "subject"],
        });
        if (!divisionSubject) {
            throw new NotFoundException(`DivisionSubject with ID ${id} not found`);
        }
        return divisionSubject;
    }
    async findByQuery(query: unknown): Promise<DivisionSubject> {
        const divisionSubject = await this.divisionSubjectRepository.findOne({
            where: query,
        });

        return divisionSubject;
    }

    async customFindBuQuery(query) {
        const divisionSubject = await this.divisionSubjectRepository.find(query);

        return divisionSubject;
    }
    async findUniqTeacher(query: any) {
        const divisionSubject = await this.divisionSubjectRepository.find({
            where: {
                ...query.where,
                id: Not(query.excludeId), // Exclude the current ID
            },
        });

        return divisionSubject;
    }
    async delete(id: number) {
        const divisionSubject = await this.findById(id);
        if (!divisionSubject) {
            throw new Error("divisionSubject not found");
        }

        divisionSubject.deleted_at = new Date();
        return await this.divisionSubjectRepository.save(divisionSubject);
    }
    async getStudentsCount(subjectId: number) {
        const divisionSubject = await this.divisionSubjectRepository
            .createQueryBuilder("divisionSubject")
            .where("divisionSubject.subject_id = :subjectId", { subjectId: subjectId })
            .loadRelationCountAndMap("divisionSubject.studentCount", "divisionSubject.students", "student")
            .getOne();
        return divisionSubject;
    }

    async update(id: number, updateDivisionSubjectDto: UpdateDivisionSubjectDto): Promise<DivisionSubject> {
        const divisionSubject = await this.divisionSubjectRepository.findOne({ where: { id } });
        Object.assign(divisionSubject, updateDivisionSubjectDto);
        await this.divisionSubjectRepository.save(divisionSubject);
        return this.findById(id);
    }

    async createBulk(classSubjects: Partial<DivisionSubject>[]) {
        const savedClasssubject = await this.divisionSubjectRepository.save(classSubjects);
        return savedClasssubject;
    }

    async getDivisionSubjectByBatchId(batchId: number) {
        const divisionSubject = await this.divisionSubjectRepository.find({
            where: { batch_id: batchId }, // Fetch division where batch_id matches
        });

        // If no division found for the given batch_id, return empty array
        if (!divisionSubject.length) {
            return [];
        }

        return divisionSubject;
    }

    async getAllData(ids: number[]) {
        const divisionSubjects = await this.divisionSubjectRepository
            .createQueryBuilder("divisionSubject")
            .leftJoinAndSelect("divisionSubject.students", "student") // Join the students relation
            .leftJoin("class_subjects_students", "css", "css.classsubject_id = divisionSubject.id") // Join the class_subjects_students table
            .where("css.classsubject_id IN (:...ids)", { ids }) // Match classsubject_id with the passed IDs
            .getMany();

        if (!divisionSubjects.length) {
            return [];
        }
        return divisionSubjects;
    }

    async findAssociateStudents(ids: number[]) {
        return await this.divisionSubjectRepository
            .createQueryBuilder("ds") // Alias for division_subjects
            .innerJoin("class_subjects_students", "css", "ds.id = css.classsubject_id") // Join on the join table
            .where("ds.id IN (:...ids)", { ids }) // Filter by classsubject_id
            .select(["css.id", "css.classsubject_id", "css.student_id"]) // Select only join table fields
            .getRawMany();
    }

    /*
     *   Find Stundents for Study Material Module
     */
    async findByStudentId(studentId: number) {
        return await this.divisionSubjectRepository.findOne({
            where: {
                students: { id: studentId },
            },
            relations: ["students"], // Ensure the `students` relation is loaded
        });
    }

    async getTeacherForEvent(query: any) {
        return await this.divisionSubjectRepository.find({
            select: ["teacher_id"],
            where: query,
        });
    }

    async findClassSubject(query: any): Promise<DivisionSubject[]> {
        const divisionSubject = await this.divisionSubjectRepository.find({
            where: query,
        });

        return divisionSubject;
    }

    async findUniqueClassForTeacher(query: unknown): Promise<DivisionSubject[]> {
        // Fetch division subjects based on the query
        let divisionSubjects = await this.divisionSubjectRepository.find({
            where: query,
            relations: [""],
        });

        // Check if divisionSubjects has records
        if (divisionSubjects?.length) {
            const uniqueDivisionSubjectsMap = new Map<number, DivisionSubject>();

            // Iterate through divisionSubjects and filter unique records based on `grade_class_id`
            divisionSubjects.forEach((subject) => {
                if (!uniqueDivisionSubjectsMap.has(subject.grade_class_id)) {
                    uniqueDivisionSubjectsMap.set(subject.grade_class_id, subject);
                }
            });

            // Update divisionSubjects with unique values
            divisionSubjects = Array.from(uniqueDivisionSubjectsMap.values());
        }

        return divisionSubjects;
    }

    async updateClassSubjectStudent(newClassSubjectId: number, newRecordId: number) {
        await this.divisionSubjectRepository.query(`
            UPDATE class_subjects_students 
            SET classsubject_id = ${newClassSubjectId}
            WHERE id = ${newRecordId}
        `);
    }
    async getDivisionSubjectByQuery(query: unknown): Promise<DivisionSubject[]> {
        const divisionSubject = await this.divisionSubjectRepository.find({
            where: query,
        });

        return divisionSubject;
    }

    async softDeleteDivisionSubject(data: any) {
        return await this.divisionSubjectRepository.save(data);
    }

    async fetchUserLearnerList(reqQuery: LearnerTeacherListDto) {
        const page = reqQuery.page ? parseInt(reqQuery.page, 10) : 1;
        const limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : 10;
        const offset = (page - 1) * limit;

        // Build queryObject dynamically
        const queryObject: Record<string, any> = Object.fromEntries(
            Object.entries({
                batch_id: reqQuery?.batch_id,
                // subject_id: reqQuery?.subject_id,
                school_id: reqQuery?.school_id,
                grade_id: reqQuery?.grade_id,
                grade_class_id: reqQuery?.grade_class_id,
                master_subject_id: reqQuery?.master_subject_id,
            }).filter(([_, value]) => isValidQueryValue(value))
        );
        console.log("🚀 ~ DivisionSubjectService ~ fetchUserLearnerList ~ queryObject:", queryObject);

        // Fetch related data
        const divisionSubject = await this.divisionSubjectRepository.find({
            where: queryObject,
            relations: ["teacher", "grade", "master_subject", "division"],
        });

        if (!divisionSubject.length) return { data: [], pagination: { totalCount: 0, currentPage: page, totalPages: 0 } };

        let data: any = [];

        if (reqQuery.type === "teacher") {
            // Remove duplicate teachers by teacher_id
            const uniqueTeachers = Array.from(new Map(divisionSubject.map((item) => [item.teacher_id, item.teacher])).values()).filter(Boolean); // Filter out null teachers
            data = uniqueTeachers;
        } else {
            // Fetch associated students
            const classSubjectIds = divisionSubject.map((data) => data.id);
            const associatedStudents = await this.findAssociateStudents(classSubjectIds);
            const uniqueStudentIds = [...new Set(associatedStudents.map((data) => data.css_student_id))];

            const students = (await this.studentService.getStudentByQuery({ id: In(uniqueStudentIds) })).filter(Boolean);
            data = students;
        }

        // Pagination Logic
        const totalCount = data.length;
        data = data.slice(offset, offset + limit);

        return {
            totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            data,
        };
    }
}
