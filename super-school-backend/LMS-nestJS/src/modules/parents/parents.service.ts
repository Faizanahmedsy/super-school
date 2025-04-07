import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, In, Repository } from "typeorm";
import { Parent } from "./parents.entity";
import { CreateParentDto } from "./dtos/create-parents.dto";
import { UpdateParentDto } from "./dtos/update-parents.dto";
import { StudentService } from "../student/student.service";
import { NotificationService } from "../notification/notification.service";
import { Student } from "../student/student.entity";

@Injectable()
export class ParentService {
    constructor(
        @InjectRepository(Parent)
        private parentRepository: Repository<Parent>,
        // private studentService: StudentService,
        private notificationService: NotificationService
    ) {}

    async isExist(query: any) {
        return await this.parentRepository.findOne({ where: query });
    }

    async create(parent) {
        const user = await this.parentRepository.save(parent);

        return user;
    }

    // async createParent(createParentDto: CreateParentDto): Promise<Parent> {
    //     try {
    //         const newParent = this.parentRepository.create(createParentDto);
    //         const savedParent = await this.parentRepository.save(newParent);

    //         if (createParentDto.student_ids_string) {
    //             const studentIds = createParentDto.student_ids_string.split(",").map((id) => Number(id.trim()));
    //             const students = await this.studentService.findStudentsByIds(studentIds);

    //             if (students.length === 0) {
    //                 throw new Error("No students found for the provided IDs");
    //             }
    //             savedParent.students = students;
    //             await this.parentRepository.save(savedParent);
    //         }

    //         return savedParent;
    //     } catch (error) {
    //         console.error("Error creating parent:", error.message);
    //         throw error;
    //     }
    // }

    async findParentsByIds(divisionIds: number[]): Promise<Parent[]> {
        return await this.parentRepository.findBy({
            id: In(divisionIds), // Using the "In" operator to search for matching IDs
        });
    }

    async getParentByEmail(email: string): Promise<Parent | null> {
        return await this.parentRepository.findOne({
            where: {
                email,
            },
            withDeleted: true, // If using soft deletes, this will include deleted records
        });
    }

    async getAllParentByEmail(emailArray: string[]): Promise<Parent[] | null> {
        return await this.parentRepository.find({
            where: {
                email: In(emailArray),
            },
        });
    }

    async getParents(reqQuery: any): Promise<{
        totalCount: number;
        totalPages: number;
        currentPage: number;
        list: Parent[];
    }> {
        const page = reqQuery.page ? parseInt(reqQuery.page, 10) : 1;
        const limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : 10;

        const offset = (page - 1) * limit;
        const sortField = reqQuery.sortField || "created_at";
        const sortDirection = reqQuery.sort === "asc" ? "ASC" : "DESC";
        console.log(reqQuery.school_id, "================================");
        const filterConditions: any = {};
        const searchConditions: any[] = [];
        if (reqQuery.search && reqQuery.search.trim() !== "") {
            const searchValue = `%${reqQuery.search.trim()}%`;
            searchConditions.push({ first_name: ILike(searchValue) });
            searchConditions.push({ last_name: ILike(searchValue) });
        }
        if (reqQuery.school_id && reqQuery.school_id !== "undefined") {
            filterConditions.school_id = reqQuery.school_id;
        }

        const finalQuery = searchConditions.length > 0 ? searchConditions.map((condition) => ({ ...filterConditions, ...condition })) : filterConditions;
        const [parents, totalCount] = await this.parentRepository.findAndCount({
            where: finalQuery,
            relations: ["institute", "institute.city", "institute.state", "students"],
            select: {
                institute: {
                    id: true,
                    school_name: true,
                    province_id: true,
                    district_id: true,
                },
            },
            order: {
                [sortField]: sortDirection,
            },
            skip: reqQuery.page ? offset : null,
            take: reqQuery.page ? limit : null,
        });

        const totalPages = Math.ceil(totalCount / limit);
        const list = parents.map((parent) => ({
            ...parent, // Copy all fields
            institute: {
                ...parent.institute, // Spread existing institute properties
                city: parent.institute?.city || null, // Include city object
                state: parent.institute?.state || null, // Include state object
            },
        }));
        return {
            totalCount,
            totalPages,
            currentPage: page,
            list: list,
        };
    }

    async getParentsByStudentId(studentUserId: number): Promise<Parent[]> {
        return await this.parentRepository.find({
            where: {
                students: {
                    id: studentUserId,
                },
            },
            relations: ["students"], // Include the `students` relationship if necessary
        });
    }

    async getParentById(id: number) {
        const parent = await this.parentRepository.findOne({
            where: { id },
            relations: [
                "students",
                "institute",
                "institute.city", // Include city relation
                "institute.state", // Include state relation
            ],
        });

        if (!parent) {
            return null;
        }

        // Return the parent with the state and city objects
        return {
            ...parent,
            institute: {
                ...parent.institute, // Spread existing institute properties
                city: parent.institute?.city || null, // Include city object
                state: parent.institute?.state || null, // Include state object
            },
        };
    }

    async getParentByObj(obj: any) {
        const parent = await this.parentRepository.findOne({
            where: obj,
            relations: [
                "students",
                "institute",
                "institute.city", // Include city relation
                "institute.state", // Include state relation
            ],
        });

        if (!parent) {
            throw new Error("Parent not found");
        }

        // Return the parent with the state and city objects
        return {
            ...parent,
            institute: {
                ...parent.institute, // Spread existing institute properties
                city: parent.institute?.city || null, // Include city object
                state: parent.institute?.state || null, // Include state object
            },
        };
    }

    async getParentForLogin(obj: any) {
        const parent = await this.parentRepository.findOne({
            where: obj,
            relations: [
                "students",
                "institute",
                "institute.city", // Include city relation
                "institute.state", // Include state relation
            ],
        });

        if (!parent) {
            return null;
        }

        // Return the parent with the state and city objects
        return {
            ...parent,
            institute: {
                ...parent.institute, // Spread existing institute properties
                city: parent.institute?.city || null, // Include city object
                state: parent.institute?.state || null, // Include state object
            },
        };
    }
    // async updateParent(id: number, updateParentDto: UpdateParentDto): Promise<Parent> {
    //     try {
    //         const parent = await this.getParentById(id);
    //         Object.assign(parent, updateParentDto);
    //         if (updateParentDto.student_ids_string) {
    //             const studentIds = updateParentDto.student_ids_string.split(",").map((id) => Number(id.trim()));
    //             const students = await this.studentService.findStudentsByIds(studentIds);
    //             if (students.length === 0) {
    //                 throw new Error("No students found for the provided IDs");
    //             }
    //             parent.students = students;
    //         }

    //         const updatedParent = await this.parentRepository.save(parent);

    //         return updatedParent;
    //     } catch (error) {
    //         console.error("Error updating parent:", error.message);
    //         throw error;
    //     }
    // }

    // async updateParent(id: number, updateParentDto: UpdateParentDto) {
    //     const parent = await this.getParentById(id);
    //     if (!parent) {
    //         console.log("Parent not found");
    //         throw new Error("Parent not found");
    //     }

    //     Object.assign(parent, updateParentDto);

    //     return await this.parentRepository.save(parent);
    // }

    async updateParent(parentId: number, updateData: Partial<Parent>) {
        const parent = await this.parentRepository.findOne({
            where: { id: parentId },
            withDeleted: true,
        });

        if (!parent) {
            throw new Error("Parent not found");
        }

        // If the parent is soft-deleted, restore them by nullifying `deleted_at`
        if (parent.deleted_at) {
            updateData.deleted_at = null; // Restore the parent (undelete)
        }

        // Update parent fields
        await this.parentRepository.update(parentId, {
            ...updateData,
            updated_at: new Date(),
        });

        return this.parentRepository.findOne({
            where: { id: parentId },
        }); // Return the updated parent
    }

    async createParent(CreateParentDto: Partial<Parent>): Promise<Parent> {
        const parent = this.parentRepository.create(CreateParentDto);
        return await this.parentRepository.save(parent);
    }

    // async deleteParent(id: number) {
    //     const parent = await this.getParentById(id);
    //     if (!parent) {
    //         throw new NotFoundException(`Parent with ID ${id} not found`);
    //     }
    //     parent.deleted_at = new Date();
    //     return await this.parentRepository.save(parent);
    // }

    async softDeleteParent(parentId: number, userId: number) {
        console.log("Parent ID:", parentId); // Log the parentId for debugging

        const parent = await this.parentRepository.findOne({
            where: { id: parentId },
            withDeleted: true, // Include soft-deleted records in the search
        });

        if (!parent) {
            console.log("Parent not found in database");
            throw new Error("Parent not found");
        }

        console.log("Existing Parent:", parent); // Log the parent to ensure it's fetched

        // Check if the parent is already soft deleted
        if (parent.deleted_at) {
            throw new Error("Parent already deleted");
        }

        // Set the deleted_at field to the current time and track who deleted it
        parent.deleted_at = new Date();
        parent.deleted_by = userId;

        // Save the updated parent (this will update the existing record)
        await this.parentRepository.save(parent);

        // Return the updated parent entity
        return parent;
    }

    async getParentByQuery(query: any) {
        return await this.parentRepository.find({ where: query });
    }

    async getParentStudentRelation(studentId: number, parentId: number) {
        return await this.parentRepository
            .createQueryBuilder("p")
            .innerJoin("students_parents", "ps", "p.id = ps.parent_id")
            .where("ps.student_id = :studentId", { studentId })
            .andWhere("ps.parent_id = :parentId", { parentId })
            .select(["ps.id AS id", "ps.student_id AS studentId", "ps.parent_id AS parentId"])
            .getRawOne();
    }

    async removeParentStudentRelation(relationId: number) {
        return await this.parentRepository.createQueryBuilder().delete().from("students_parents").where("id = :relationId", { relationId }).execute();
    }

    async fetchLearnerList(reqQuery: any) {
        const page = reqQuery.page ? parseInt(reqQuery.page, 10) : 1;
        const limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : 10;
        const offset = (page - 1) * limit;

        let parentId = reqQuery.parentId;
        let students: Student[];

        const searchConditions: any[] = [];

        const parent = await this.parentRepository.findOne({
            where: { parent_user_id: parentId },
            relations: ["students"],
        });

        students = parent.students;

        if (reqQuery.search && reqQuery.search.trim() !== "") {
            let search = reqQuery.search.trim().toLowerCase();
            const searchRegex = new RegExp(reqQuery.search, "i");
            students = students.filter(
                (student) =>
                    (student.first_name && student.first_name.toLowerCase().includes(search)) ||
                    (student.last_name && student.last_name.toLowerCase().includes(search)) ||
                    (student.addmission_no && student.addmission_no.toLowerCase().includes(search))
            );
        }

        if (reqQuery.grade_id && reqQuery.grade_id !== "undefined") {
            let gradeId = reqQuery.grade_id;
            students = students.filter((student) => String(student.grade_id) == String(gradeId));
        }

        if (reqQuery.batch_id && reqQuery.batch_id !== "undefined") {
            let batchId = reqQuery.batch_id;
            students = students.filter((student) => String(student.cur_batch_id) == String(batchId));
        }

        const list = students.slice(offset, offset + limit);
        const totalCount = students.length;

        return {
            totalCount: totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            list,
        };
    }

    async parentWithStudent(query: any) {
        return await this.parentRepository.findOne({
            where: query,
            relations: ["students"],
        });
    }
}
