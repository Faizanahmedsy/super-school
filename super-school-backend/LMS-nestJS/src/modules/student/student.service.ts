import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";
import { Student } from "./student.entity";
import { CreateStudentDto } from "./dtos/create-student.dto";
import { UpdateStudentDto } from "./dtos/update-student.dto";
import { NotificationService } from "../notification/notification.service";
import { Parent } from "../parents/parents.entity";
import { ParentService } from "../parents/parents.service";

@Injectable()
export class StudentService {
    constructor(
        @InjectRepository(Student) private studentRepository: Repository<Student>,
        @InjectRepository(Parent) private parentRepository: Repository<Parent>,

        private readonly parentService: ParentService
    ) {}

    async isExist(query: any) {
        return await this.studentRepository.findOne({ where: query });
    }

    // async createStudent(createStudentDto) {
    //     delete createStudentDto.parent;
    //     const newStudent = this.studentRepository.create(createStudentDto);
    //     return await this.studentRepository.save(newStudent);
    // }

    async createStudent(createStudentDto: CreateStudentDto): Promise<Student> {
        try {
            const newStudent = this.studentRepository.create(createStudentDto);
            const savedStudent = await this.studentRepository.save(newStudent);

            // If parent IDs are passed, handle the parent-child relationship
            if (createStudentDto.parent_ids_string) {
                const parentIds = createStudentDto.parent_ids_string.split(",").map((id) => Number(id.trim()));

                // Fetch the parents using the IDs
                const parents = await this.parentService.findParentsByIds(parentIds);

                // If no parents are found for the provided IDs, throw an error
                if (parents.length === 0) {
                    throw new Error("No parents found for the provided IDs");
                }

                // Set the parents to the student entity (many-to-many relationship)
                savedStudent.parents = parents;

                // Save the updated student with the parent-child relationship
                await this.studentRepository.save(savedStudent);

                // Now, add the parent-child relation to the student_parent table
                for (const parent of parents) {
                    await this.studentRepository.save({
                        student_id: savedStudent.id,
                        parent_id: parent.id,
                        created_by: createStudentDto.created_by,
                    });
                }
            }

            return savedStudent;
        } catch (error) {
            console.error("Error creating student:", error.message);
            throw error;
        }
    }

    // async createStudent(createStudentDto: CreateStudentDto, req: any) {
    //     const {
    //         parents, // Destructure parents from the DTO
    //         ...studentData
    //     } = createStudentDto;

    //     // Step 1: Create the student
    //     const student = this.studentRepository.create({
    //         ...studentData,
    //         created_by: req.user.id,
    //     });
    //     const savedStudent = await this.studentRepository.save(student);

    //     // Step 2: Create and link parents
    //     if (parents && parents.length > 0) {
    //         const parentEntities = parents.map(parent => this.parentRepository.create({
    //             ...parent,
    //             created_by: req.user.id,
    //         }));

    //         const savedParents = await this.parentRepository.save(parentEntities);

    //         // Link parents to the student
    //         savedStudent.parents = savedParents;
    //         await this.studentRepository.save(savedStudent);
    //     }

    //     return savedStudent;
    // }

    async findStudentsByIds(divisionIds: number[]): Promise<Student[]> {
        return await this.studentRepository.findByIds(divisionIds);
    }
    async getStudents(reqQuery: any): Promise<{
        totalCount: number;
        totalPages: number;
        currentPage: number;
        list: Student[];
    }> {
        const page = reqQuery.page ? parseInt(reqQuery.page, 10) : 1;
        const limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : 10;
        const offset = (page - 1) * limit;
        const filterConditions: any = {};
        const searchConditions: any[] = [];
        if (reqQuery.search && reqQuery.search.trim() !== "") {
            const searchValue = `%${reqQuery.search.trim()}%`;
            searchConditions.push({ addmission_no: ILike(searchValue) });
            searchConditions.push({ first_name: ILike(searchValue) });
            searchConditions.push({ last_name: ILike(searchValue) });
        }
        if (reqQuery.school_id && reqQuery.school_id !== "undefined") {
            filterConditions.school_id = reqQuery.school_id;
        }
        if (reqQuery.division_id && reqQuery.division_id !== "undefined") {
            filterConditions.division_id = reqQuery.division_id;
        }
        if (reqQuery.batch_id && reqQuery.batch_id !== "undefined") {
            filterConditions.cur_batch_id = reqQuery.batch_id;
        }
        if (reqQuery.grade_id && reqQuery.grade_id !== "undefined") {
            filterConditions.grade_id = reqQuery.grade_id;
        }

        if (reqQuery?.addmission_no && reqQuery.addmission_no != "") {
            filterConditions.addmission_no = reqQuery.addmission_no;
        }
        const finalQuery = searchConditions.length > 0 ? searchConditions.map((condition) => ({ ...filterConditions, ...condition })) : filterConditions;

        const sortOrder = reqQuery.sort && reqQuery.sort.toLowerCase() === "asc" ? "ASC" : "DESC";
        const sortField = reqQuery.sortField || "created_at";
        const [students, totalCount] = await this.studentRepository.findAndCount({
            where: finalQuery,
            relations: ["institute", "division", "batch", "grade", "parents", "institute.city", "institute.state"],
            order: {
                [sortField]: sortOrder,
            },
            skip: reqQuery.page ? offset : null,
            take: reqQuery.page ? limit : null,
        });

        const totalPages = Math.ceil(totalCount / limit);

        return {
            totalCount,
            totalPages,
            currentPage: page,
            list: students,
        };
    }
    async addStudentToDivisionSubject(studentId: number, divisionSubjectIds: number[]) {
        await this.studentRepository.createQueryBuilder().relation(Student, "divisionSubjects").of(studentId).add(divisionSubjectIds);
    }

    async updateStudentDivisionSubjects(studentId: number, divisionSubjectIds: number[]) {
        const existingDivisionSubjects = await this.studentRepository.createQueryBuilder().relation(Student, "divisionSubjects").of(studentId).loadMany();

        if (existingDivisionSubjects.length > 0) {
            await this.studentRepository
                .createQueryBuilder()
                .relation(Student, "divisionSubjects")
                .of(studentId)
                .remove(existingDivisionSubjects.map((subject) => subject.id));
        }

        if (divisionSubjectIds.length > 0) {
            await this.studentRepository.createQueryBuilder().relation(Student, "divisionSubjects").of(studentId).add(divisionSubjectIds);
        }
    }
    async getStudentById(id: number) {
        const student = await this.studentRepository.findOne({
            where: { id },
            relations: ["institute", "division", "batch", "grade", "parents", "institute.city", "institute.state"],
        });

        if (student?.parents) {
            student.parents.sort((a, b) => a.id - b.id);
        }
        if (!student) {
            throw new Error("student not found");
        }

        return {
            ...student,
            institute: {
                ...student.institute,
                city: student.institute?.city || null,
                state: student.institute?.state || null,
            },
        };
    }

    async getStudentSubjectById(id: number, grade_class_id: number) {
        return await this.studentRepository
            .createQueryBuilder("student")
            .leftJoinAndSelect("student.divisionSubjects", "divisionSubject")
            .leftJoinAndSelect("divisionSubject.teacher", "teacher")
            .leftJoinAndSelect("divisionSubject.subject", "subject")
            .leftJoinAndSelect("divisionSubject.master_subject", "master_subject")
            .leftJoinAndSelect("divisionSubject.grade", "grade")
            .leftJoinAndSelect("divisionSubject.term", "term")
            .leftJoinAndSelect("student.parents", "parent")
            .where("student.id = :id", { id })
            .andWhere("divisionSubject.grade_class_id = :grade_class_id", { grade_class_id })
            .distinctOn(["divisionSubject.subject_id"])
            .orderBy("divisionSubject.subject_id", "ASC")
            .addOrderBy("divisionSubject.created_at", "DESC")
            .getOne();
    }

    // Example of getParentsByStudentId method (assuming TypeORM)
    async getParentsByStudentId(studentId: number) {
        try {
            const student = await this.studentRepository.findOne({
                where: { id: studentId },
                relations: ["parents"], // Make sure this is the correct relation name
            });

            if (!student) {
                console.log("Student not found");
                return [];
            }

            console.log("Parents fetched:", student.parents); // Debugging line to check the fetched parents
            return student.parents || [];
        } catch (error) {
            console.error("Error fetching parents:", error.message);
            throw error;
        }
    }

    async addParentToStudent(payload: {
        student_id: number;
        parent_id: number;
        relationship: string;
        created_by: number;
        first_name: string; // Add first_name
        last_name: string; // Add last_name
    }) {
        try {
            const association = this.studentRepository.create(payload);
            await this.studentRepository.save(association);
            console.log("Parent-student association added:", association);
            return association;
        } catch (error) {
            console.error("Error adding parent-student association:", error);
            throw error;
        }
    }

    async getAllStudentBySubjectId(query: { [key: string]: string }) {
        const createQueryObj = this.studentRepository
            .createQueryBuilder("student")
            .leftJoinAndSelect("student.divisionSubjects", "divisionSubject")
            .leftJoinAndSelect("divisionSubject.teacher", "teacher")
            .leftJoinAndSelect("divisionSubject.subject", "subject")
            .leftJoinAndSelect("divisionSubject.master_subject", "master_subject")
            .leftJoinAndSelect("divisionSubject.grade", "grade")
            .leftJoinAndSelect("divisionSubject.term", "term")
            .leftJoinAndSelect("student.institute", "institute") // Join institute
            .leftJoinAndSelect("institute.city", "city") // Join city for institute
            .leftJoinAndSelect("institute.state", "state");

        if (query.batch_id && query.batch_id.trim() !== "") {
            createQueryObj.andWhere("divisionSubject.batch_id = :batch_id", { batch_id: query.batch_id });
        }

        if (query.division_id && query.division_id.trim() !== "") {
            createQueryObj.andWhere("divisionSubject.division_id = :division_id", { division_id: query.division_id });
        }

        if (query.grade_id && query.grade_id.trim() !== "") {
            createQueryObj.andWhere("divisionSubject.grade_id = :grade_id", { grade_id: query.grade_id });
        }

        if (query.school_id && query.school_id.trim() !== "") {
            createQueryObj.andWhere("divisionSubject.school_id = :school_id", { school_id: query.school_id });
        }

        if (query.term_id && query.term_id.trim() !== "") {
            createQueryObj.andWhere("divisionSubject.term_id = :term_id", { term_id: query.term_id });
        }

        return await createQueryObj.getMany();
    }

    async getStudentByObj(obj: any) {
        const student = await this.studentRepository.findOne({
            where: obj,
            relations: ["institute", "division", "batch", "grade", "parents", "institute.city", "institute.state"],
        });
        if (!student) {
            throw new Error("student not found");
        }
        let findStudent = await this.getStudentSubjectById(student.id, student.grade_class_id);
        if (findStudent) {
            student["divisionSubjects"] = findStudent?.divisionSubjects;
        } else {
            student["divisionSubjects"] = [];
        }
        return {
            ...student,
            institute: {
                ...student.institute,
                city: student.institute?.city || null,
                state: student.institute?.state || null,
            },
        };
    }
    async getStudentForLogin(obj: any) {
        const student = await this.studentRepository.findOne({
            where: obj,
            relations: ["institute", "division", "batch", "grade", "parents", "institute.city", "institute.state"],
        });
        if (!student) {
            return null;
        }
        let findStudent = await this.getStudentSubjectById(student.id, student.grade_class_id);
        if (findStudent) {
            student["divisionSubjects"] = findStudent?.divisionSubjects;
        } else {
            student["divisionSubjects"] = [];
        }
        return {
            ...student,
            institute: {
                ...student.institute,
                city: student.institute?.city || null,
                state: student.institute?.state || null,
            },
        };
    }
    async updateStudent(id: number, updateStudentDto: UpdateStudentDto) {
        const student = await this.getStudentById(id);
        Object.assign(student, updateStudentDto);
        return await this.studentRepository.save(student);
    }

    async getStudent(id: number) {
        const student = await this.studentRepository.findOne({
            where: { id },
        });
        if (!student) {
            throw new Error("student not found");
        }

        return student;
    }

    async updateStudent1(id: number, updateStudentDto: UpdateStudentDto) {
        try {
            const student = await this.getStudent(id);
            if (!student) {
                throw new Error("Student not found");
            }
            Object.assign(student, updateStudentDto);
            const updatedStudent = await this.studentRepository.save(student);
            return updatedStudent;
        } catch (error) {
            console.error("Error updating student:", error.message);
            throw error;
        }
    }

    async updateParents(id: number, parents: []) {
        try {
            const student = await this.getStudentById(id);
            Object.assign(student, {});
            const allParents = await this.parentService.findParentsByIds(parents);
            student.parents = allParents;
            const updatedParent = await this.studentRepository.save(student);
            return updatedParent;
        } catch (error) {
            console.error("Error updating parent:", error.message);
            throw error;
        }
    }
    async updateParentForStudent(studentId: number, parentId: number) {
        try {
            const student = await this.studentRepository.findOne({
                where: { id: studentId },
                relations: ["parents"],
            });
            if (!student) {
                throw new Error("Student not found");
            }
            const parent = await this.parentRepository.findOne({
                where: { id: parentId },
            });
            if (!parent) {
                throw new Error("Parent not found");
            }
            if (!Array.isArray(student.parents)) {
                student.parents = [];
            }
            student.parents.push(parent);
            const updatedStudent = await this.studentRepository.save(student);

            return updatedStudent;
        } catch (error) {
            console.error("Error updating parent for student:", error.message);
            throw error;
        }
    }

    async deleteStudent(id: number) {
        const student = await this.getStudentById(id);

        if (!student) {
            throw new Error("Student not found");
        }

        student.deleted_at = new Date();

        return await this.studentRepository.save(student);
    }

    async updateUserProfileImage(userId: number, fileUrl: string) {
        const student = await this.studentRepository.findOne({
            where: { id: userId },
        });

        if (!student) {
            throw new Error("Student not found");
        }

        student.profile_image = fileUrl;

        return await this.studentRepository.save(student);
    }
    async getMappedStudents(divisionSubjectId: number): Promise<Student[]> {
        return this.studentRepository
            .createQueryBuilder("student")
            .innerJoin("student.divisionSubjects", "divisionSubject")
            .where("divisionSubject.id = :divisionSubjectId", { divisionSubjectId })
            .getMany();
    }
    async remapStudents(oldSubjectId: number, newSubjectId: number, students: any): Promise<void> {
        // Remove old relation and add new relation
        await this.studentRepository
            .createQueryBuilder()
            .relation(Student, "divisionSubjects")
            .of(students.map((student) => student.id))
            .remove(oldSubjectId);

        await this.studentRepository
            .createQueryBuilder()
            .relation(Student, "divisionSubjects")
            .of(students.map((student) => student.id))
            .add(newSubjectId);
    }

    async getStudentForEvent(obj: any) {
        return await this.studentRepository.find({
            select: ["student_user_id"],
            where: obj,
        });
    }

    async getStudentByQuery(query: any) {
        return await this.studentRepository.find({ where: query });
    }
    async getStudentParentRelation(query: any) {
        return await this.studentRepository.find({
            where: query,
            relations: ["parents"],
        });
    }
    async getStudentCountBySchool(schoolId: number) {
        return await this.studentRepository.count({ where: { school_id: schoolId } });
    }

    async getStudentForDetail(id: number) {
        const student = await this.studentRepository.findOne({
            where: { id },
            relations: ["institute", "division", "batch", "grade", "parents", "institute.city", "institute.state"],
        });
        if (!student) {
            return null;
        }

        if (student?.parents) {
            student.parents.sort((a, b) => a.id - b.id);
        }

        return {
            ...student,
            institute: {
                ...student.institute,
                city: student.institute?.city || null,
                state: student.institute?.state || null,
            },
        };
    }
}
