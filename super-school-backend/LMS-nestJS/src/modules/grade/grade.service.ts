import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, In, Repository } from "typeorm";
import { Grade } from "./grade.entity";
import { CreateGradeDto } from "./dtos/create-grade.dto";
import { UpdateGradeDto } from "./dtos/update-grade.dto";
import { DivisionSubject } from "../division_subject/divisionsubject.entity";

@Injectable()
export class GradeService {
    constructor(
        @InjectRepository(Grade)
        private gradeRepository: Repository<Grade>,

        @InjectRepository(DivisionSubject)
        private divisionSubjectRepository: Repository<DivisionSubject> // private classSubjectRepository: Repository<DivisionSubject>
    ) {}

    async isExist(obj: any): Promise<boolean> {
        const grade = await this.gradeRepository.findOne({ where: obj });
        return !!grade;
    }

    async isExist1(id: number): Promise<Grade | null> {
        return await this.gradeRepository.findOne({ where: { id } });
    }

    async updateGradeBatchId(gradeId: number, newBatchId: number): Promise<void> {
        await this.gradeRepository.update(gradeId, { batch_id: newBatchId });
    }

    async prepareGradeData(oldGrades: Grade[], newBatchId: number, userId: number): Promise<Partial<Grade>[]> {
        // Map over old grades and create new grade data for the new batch
        return oldGrades.map((grade) => {
            return {
                ...grade,
                batch_id: newBatchId,
                created_by: userId,
                created_at: new Date(),
                updated_at: new Date(),
            };
        });
    }
    async getAllGrades(): Promise<Grade[]> {
        return await this.gradeRepository.find({
            where: { deleted_at: null },
        });
    }

    async createGrade(createGradeDto: CreateGradeDto) {
        const newGrade = this.gradeRepository.create(createGradeDto);
        return await this.gradeRepository.save(newGrade);
    }

    async createBulk(grade: Partial<Grade>[]) {
        console.log("🚀 🚀 <<<<<< createBulk Data >>>>>>", grade);
        return await this.gradeRepository.save(grade);
    }

    async multiCreate(createGradeDto: { grade_number: number; description: string; created_by: number }) {
        const newGrade = this.gradeRepository.create(createGradeDto);
        return await this.gradeRepository.save(newGrade);
    }

    // async getGrades(reqQuery: any): Promise<{
    // 	totalCount: number;
    // 	totalPages: number;
    // 	currentPage: number;
    // 	list: any[];
    // }> {
    // 	const page = reqQuery.page ? parseInt(reqQuery.page, 10) : 1;
    // 	const limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : 10;

    // 	const offset = (page - 1) * limit;
    // 	const sortOrder = reqQuery.sort === "desc" ? "DESC" : "ASC";

    // 	let queryBuilder = this.gradeRepository
    // 		.createQueryBuilder("grade")
    // 		.leftJoinAndSelect("grade.institute", "institute") // Include related institute data
    // 		.leftJoinAndSelect("grade.batch", "batch") // Include related batch data
    // 		.loadRelationCountAndMap("grade.studentCount", "grade.students") // Map the count of students
    // 		.where("grade.deleted_at IS NULL")
    // 		.orderBy("grade.created_at", sortOrder)
    // 		.skip(reqQuery.page ? offset : null)
    // 		.take(reqQuery.page ? limit : null);

    // 	// Apply search filter
    // 	if (reqQuery.search && reqQuery.search !== "undefined" && reqQuery.search !== "") {
    // 		queryBuilder = queryBuilder.andWhere("CAST(grade.grade_number AS TEXT) ILIKE :search", { search: `%${reqQuery.search}%` });
    // 	}

    // 	// Apply school_id filter
    // 	if (reqQuery.school_id && reqQuery.school_id !== "undefined" && reqQuery.school_id !== "") {
    // 		queryBuilder = queryBuilder.andWhere("grade.school_id = :school_id", { school_id: reqQuery.school_id });
    // 	}

    // 	// Apply batch_id filter
    // 	if (reqQuery.batch_id && reqQuery.batch_id !== "undefined" && reqQuery.batch_id !== "") {
    // 		queryBuilder = queryBuilder.andWhere("grade.batch_id = :batch_id", { batch_id: reqQuery.batch_id });
    // 	}

    // 	// Apply Teacher Id Filter
    // 	if (reqQuery.teacher_id && reqQuery.teacher_id !== "undefined" && reqQuery.teacher_id !== "") {
    // 		queryBuilder = queryBuilder.andWhere("class_subjects.teacher_id = :teacher_id", { teacher_id: reqQuery.teacher_id });
    // 	}

    // 	// Execute query and get results
    // 	const [grades, totalCount] = await queryBuilder.getManyAndCount();

    // 	const totalPages = Math.ceil(totalCount / limit);

    // 	return {
    // 		totalCount,
    // 		totalPages,
    // 		currentPage: page,
    // 		list: grades,
    // 	};
    // }

    /*
     *	Get Grades Based on School, Batch and Teacher Id
     */
    async getGrades(reqQuery: any): Promise<{
        totalCount: number;
        totalPages: number;
        currentPage: number;
        list: any[];
    }> {
        const page = reqQuery.page ? parseInt(reqQuery.page, 10) : null;
        const limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : null;
        const offset = page && limit ? (page - 1) * limit : null;
        const sortOrder = reqQuery.sort === "desc" ? "DESC" : "ASC";

        // Build the where clause dynamically based on the filters
        const where: any = {
            deleted_at: null, // Exclude deleted grades
        };

        if (reqQuery.search && reqQuery.search !== "undefined" && reqQuery.search !== "") {
            where.grade_number = ILike(`%${reqQuery.search}%`);
        }

        if (reqQuery.school_id && reqQuery.school_id !== "undefined" && reqQuery.school_id !== "") {
            where.school_id = reqQuery.school_id;
        }

        if (reqQuery.batch_id && reqQuery.batch_id !== "undefined" && reqQuery.batch_id !== "") {
            where.batch_id = reqQuery.batch_id;
        }

        const checkStudent = reqQuery.checkStudent === "true";

        let gradeIds: number[] | undefined;

        if (reqQuery.teacher_id && reqQuery.teacher_id !== "undefined" && reqQuery.teacher_id !== "") {
            // Fetch grade IDs where teacher_id matches
            const classSubjects = await this.divisionSubjectRepository.find({
                select: ["grade_id"], // Select only grade IDs
                where: {
                    teacher_id: reqQuery.teacher_id,
                },
            });
            gradeIds = classSubjects.map((cs) => cs.grade_id);
        }

        // If gradeIds are fetched, filter grades by those IDs
        if (gradeIds && gradeIds.length > 0) {
            where.id = In(gradeIds);
        } else if (reqQuery.teacher_id) {
            // If no grades match the teacher_id, return empty result
            return {
                totalCount: 0,
                totalPages: 0,
                currentPage: page || 1,
                list: [],
            };
        }

        // Use findAndCount or find depending on pagination
        let grades: any[];
        let totalCount: number;

        if (page && limit) {
            // Paginated query
            [grades, totalCount] = await this.gradeRepository.findAndCount({
                where,
                relations: ["institute", "batch", "students", "divisionSubjects"], // Include related data
                order: { grade_number: sortOrder },
                skip: offset,
                take: limit,
            });
        } else {
            // Fetch all data without pagination
            grades = await this.gradeRepository.find({
                where,
                relations: ["institute", "batch", "students", "divisionSubjects"], // Include related data
                order: { grade_number: sortOrder },
            });
            totalCount = grades.length;
        }

        // Calculate the student count for each grade
        const gradesWithStudentCount = grades.map((grade) => ({
            ...grade,
            studentCount: grade.students?.length || 0, // Calculate student count, default to 0
        }));

        // Filter grades if checkStudent is true
        const filteredGrades = checkStudent ? gradesWithStudentCount.filter((grade) => grade.studentCount > 0) : gradesWithStudentCount;

        const totalPages = page && limit ? Math.ceil((checkStudent ? filteredGrades.length : totalCount) / limit) : 1;

        return {
            totalCount: checkStudent ? filteredGrades.length : totalCount,
            totalPages,
            currentPage: page || 1,
            list: filteredGrades,
        };
    }

    async getGradeById(id: number) {
        return await this.gradeRepository.findOne({ where: { id, deleted_at: null } });
    }

    async updateGrade(id: number, updateGradeDto: UpdateGradeDto) {
        const grade = await this.getGradeById(id);
        if (!grade) {
            throw new NotFoundException(`Grade with ID ${id} not found`);
        }
        Object.assign(grade, updateGradeDto);
        return await this.gradeRepository.save(grade);
    }

    async deleteGrade(grade: Partial<Grade>) {
        await this.gradeRepository.save(grade);
    }

    async getGradesByBatchId(batchId: number): Promise<Grade[]> {
        return await this.gradeRepository.find({
            where: { batch_id: batchId },
            relations: ["otherRelations"], // Adjust based on your entity relations
        });
    }

    async getGradeByBatchId(batchId: number) {
        console.log(`Fetching grades for batch with ID: ${batchId}`);
        const grades = await this.gradeRepository.find({
            where: { batch_id: batchId }, // Fetch grades where batch_id matches
        });

        // If no grades found for the given batch_id, return empty array
        if (!grades.length) {
            console.warn(`No grades found for batch ID: ${batchId}`);
            return [];
        }

        return grades;
    }

    async createNewGradeEntry(oldGrade: any, newBatchId: number) {
        try {
            // Create a new grade entry based on the old grade data, but with the new batch_id
            const newGradeEntry = {
                ...oldGrade, // Copy the properties of the old grade
                batch_id: newBatchId, // Update the batch_id to the new active batch
            };

            // Insert the new grade entry into the database
            const savedGrade = await this.gradeRepository.save(newGradeEntry);
            console.log(`New grade entry created: ${savedGrade.id}`);

            return savedGrade;
        } catch (error) {
            console.error("Error while creating new grade entry:", error);
            throw new Error("Unable to create new grade entry");
        }
    }

    // async getGradesByClassSubject(teacherId: number): Promise<any[]> {
    // 	const queryBuilder = this.classSubjectRepository
    // 		.createQueryBuilder("class_subjects")
    // 		.innerJoinAndSelect("class_subjects.grade", "grade") // Join with grade table
    // 		.leftJoinAndSelect("grade.institute", "institute") // Include related institute data
    // 		.leftJoinAndSelect("grade.batch", "batch") // Include related batch data
    // 		.loadRelationCountAndMap("grade.studentCount", "grade.students") // Optionally map student count
    // 		.where("class_subjects.teacher_id = :teacherId", { teacherId }) // Filter by teacher_id
    // 		.andWhere("grade.deleted_at IS NULL") // Ensure grades are not deleted
    // 		.orderBy("grade.created_at", "ASC"); // Order by created_at (or modify as needed)

    // 	const classSubjects = await queryBuilder.getMany();
    // 	const grades = classSubjects.map((cs) => cs.grade); // Extract related grades
    // 	return grades;
    // }

    async geGradeByQuery(query: any) {
        return await this.gradeRepository.find({ where: query });
    }

    async hardDeleteGrade(gradesArray: number[]) {
        await this.gradeRepository.delete(gradesArray);
    }
}
