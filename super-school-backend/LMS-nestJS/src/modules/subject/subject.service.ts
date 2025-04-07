import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, In, Repository } from "typeorm";
import { Subject } from "./subject.entity";
import { CreateSubjectDto } from "./dtos/create-subject.dto";
import { UpdateSubjectDto } from "./dtos/update-subject.dto";
import { Grade } from "../grade/grade.entity";
import { Term } from "../term/term.entity";
import { DivisionSubjectService } from "../division_subject/divisionsubject.service";
import { DivisionSubject } from "../division_subject/divisionsubject.entity";

@Injectable()
export class SubjectService {
    constructor(
        @InjectRepository(Subject)
        private subjectRepository: Repository<Subject>,
        @InjectRepository(Grade)
        private gradeRepository: Repository<Grade>, // Inject Grade repository

        @InjectRepository(Term)
        private termRepository: Repository<Term>,
        private divisionSubjectService: DivisionSubjectService,

        @InjectRepository(DivisionSubject)
        private divisionSubjectRepository: Repository<DivisionSubject>
    ) {}

    async isExist(query: unknown): Promise<boolean> {
        const subject = await this.subjectRepository.findOne({ where: query });
        return !!subject;
    }

    async isExist1(id: number): Promise<Subject | null> {
        return await this.subjectRepository.findOne({ where: { id } });
    }

    async findSubjectsByIds(subjectIds: number[]): Promise<Subject[]> {
        return await this.subjectRepository.findByIds(subjectIds);
    }

    async getAllSubjects(): Promise<Subject[]> {
        return await this.subjectRepository.find({
            where: { deleted_at: null },
        });
    }

    // async createSubject(createSubjectDto: CreateSubjectDto): Promise<Subject> {
    //     // Log the incoming DTO
    //     console.log('Creating a new subject with data:', createSubjectDto);

    //     const newSubject = this.subjectRepository.create(createSubjectDto);

    //     // Log the created subject before saving
    //     console.log('New subject created:', newSubject);

    //     const savedSubject = await this.subjectRepository.save(newSubject);

    //     // Log the saved subject
    //     console.log('Subject saved:', savedSubject);

    //     return savedSubject;
    // }
    async createSubject(createSubjectDto: CreateSubjectDto): Promise<Subject> {
        // Log the incoming DTO
        console.log("Creating a new subject with data:", createSubjectDto);

        // Fetch the old Grade and Term based on their IDs
        const grade = await this.gradeRepository.findOneBy({ id: createSubjectDto.grade_id });
        // const term = await this.termRepository.findOneBy({ id: createSubjectDto.term_id });

        // Log the fetched grade and term
        console.log("Fetched grade:", grade);
        // console.log("Fetched term:", term);

        // If either grade or term is not found, throw an error
        if (!grade) {
            throw new Error(`Grade with ID ${createSubjectDto.grade_id} not found`);
        }
        // if (!term) {
        //     throw new Error(`Term with ID ${createSubjectDto.term_id} not found`);
        // }

        // Create the new subject using the DTO
        const newSubject = this.subjectRepository.create({
            ...createSubjectDto,
            grade, // Assign the fetched grade
            // term, // Assign the fetched term
        });

        // Log the created subject before saving
        console.log("New subject created:", newSubject);

        // Save the new subject
        const savedSubject = await this.subjectRepository.save(newSubject);

        // Log the saved subject
        console.log("Subject saved:", savedSubject);

        return savedSubject;
    }

    // async createSubject(subjectData: any): Promise<any> {
    //     console.log("Creating subject with data:", subjectData);

    //     // Assign the latest grade and term IDs dynamically
    //     subjectData.grade_id = '671'; // Replace with logic to get the correct grade
    //     subjectData.term_id = '1413'; // Replace with logic to get the correct term

    //     const savedSubject = await this.subjectRepository.save(subjectData);
    //     console.log("Subject saved successfully:", savedSubject);

    //     const fetchedSubject = await this.subjectRepository.findOne({
    //         where: { id: savedSubject.id },
    //         relations: ['grade', 'term'], // Ensure relationships are fetched
    //     });

    //     console.log("Subject fetched from database:", fetchedSubject);
    //     return fetchedSubject;
    // }

    async getSubjectByBatchIdTermIdGradeId(batchId: number, termId: number, gradeId: number): Promise<Subject | null> {
        return this.subjectRepository.findOne({
            where: { batch_id: batchId, grade_id: gradeId },
            relations: ["grade", "master_subject"], // Optional: load related entities if needed
        });
    }

    async getSubjects(reqQuery: any): Promise<{ totalCount: number; subjects: Subject[] }> {
        const { sort, limit, page } = reqQuery;

        const queryObject: any = { deleted_at: null };

        if (reqQuery.school_id && reqQuery.school_id !== "undefined" && reqQuery.school_id !== "") {
            queryObject["school_id"] = reqQuery.school_id;
        }

        if (reqQuery.batch_id && reqQuery.batch_id !== "undefined" && reqQuery.batch_id !== "") {
            queryObject["batch_id"] = reqQuery.batch_id;
        }

        if (reqQuery.grade_id && reqQuery.grade_id !== "undefined" && reqQuery.grade_id !== "") {
            queryObject["grade_id"] = reqQuery.grade_id;
        }

        // if (reqQuery.term_id && reqQuery.term_id !== "undefined" && reqQuery.term_id !== "") {
        //     queryObject["term_id"] = reqQuery.term_id;
        // }

        if (reqQuery.master_subject_id && reqQuery.master_subject_id !== "undefined" && reqQuery.master_subject_id !== "") {
            queryObject["master_subject_id"] = reqQuery.master_subject_id;
        }

        let subjectIds: number[] | undefined;

        if (reqQuery.teacher_id && reqQuery.teacher_id !== "undefined" && reqQuery.teacher_id !== "") {
            const divisionSubjects = await this.divisionSubjectRepository
                .createQueryBuilder("divisionSubject")
                .where("divisionSubject.teacher_id = :teacher_id", { teacher_id: reqQuery.teacher_id })
                .leftJoinAndSelect("divisionSubject.students", "student") // Join students to fetch associated students
                .getMany();

            subjectIds = divisionSubjects.map((cs) => cs.subject_id);
            queryObject["id"] = In(subjectIds);
        }

        const [subjects, totalCount] = await this.subjectRepository.findAndCount({
            where: queryObject,
            order: { created_at: sort === "asc" ? "ASC" : "DESC" },
            take: page ? parseInt(limit, 10) : undefined,
            skip: page ? (parseInt(page, 10) - 1) * parseInt(limit, 10) : undefined,
            relations: ["batch", "grade", "master_subject"],
        });

        const checkStudent = reqQuery.checkStudent === "true";

        await Promise.all(
            subjects.map(async (subject) => {
                try {
                    const divisionSubject: any = await this.divisionSubjectService.getStudentsCount(subject?.id);
                    subject["studentCount"] = divisionSubject?.studentCount || 0;
                } catch (error) {
                    console.error(`Error fetching student count for subject ID ${subject?.id}:`, error);
                    subject["studentCount"] = 0; // Default to 0 on error
                }
            })
        );

        // Filter based on checkStudent
        const filteredSubjects = checkStudent
            ? subjects.filter((subject) => subject["studentCount"] > 0) // Filter subjects with studentCount > 0
            : subjects;

        return {
            totalCount: checkStudent ? filteredSubjects.length : totalCount,
            subjects: filteredSubjects,
        };
    }

    async getSubjectById(id: number): Promise<Subject> {
        const subject = await this.subjectRepository.findOne({ where: { id: id } });
        if (!subject) throw new NotFoundException(`Subject with ID ${id} not found`);
        return subject;
    }

    async getSubjectByBatchId(batch_id: number): Promise<Subject[]> {
        return this.subjectRepository.find({
            where: { batch_id },
            relations: ["grade", "master_subject"], // Optional: load related entities if needed
        });
    }

    async updateSubject(id: number, updateSubjectDto: UpdateSubjectDto): Promise<Subject> {
        await this.subjectRepository.update(id, updateSubjectDto);

        return this.subjectRepository.findOne({ where: { id } });
    }

    async softDeleteSubject(data: Partial<Subject>) {
        return await this.subjectRepository.save(data);
    }

    async getSubjectByBatchId1(batchId: number) {
        console.log(`Fetching subjects for batch ID: ${batchId}`);
        return await this.subjectRepository.find({ where: { batch_id: batchId } });
    }

    async getGradesByBatchId(batchId: number): Promise<Grade[]> {
        try {
            // Query to get grades based on the batchId
            const grades = await this.gradeRepository
                .createQueryBuilder("grade")
                .innerJoinAndSelect("grade.batch", "batch")
                .where("batch.id = :batchId", { batchId })
                .getMany();

            return grades;
        } catch (error) {
            console.error("Error fetching grades:", error);
            throw new Error("Error fetching grades");
        }
    }

    // Fetch terms for a given batch ID
    async getTermsByBatchId(batchId: number): Promise<Term[]> {
        try {
            // Query to get terms based on the batchId
            const terms = await this.termRepository
                .createQueryBuilder("term")
                .innerJoinAndSelect("term.batch", "batch")
                .where("batch.id = :batchId", { batchId })
                .getMany();

            return terms;
        } catch (error) {
            console.error("Error fetching terms:", error);
            throw new Error("Error fetching terms");
        }
    }

    async updateSubjectBatchId(subjectId: number, batchId: number): Promise<void> {
        await this.subjectRepository.update(subjectId, { batch_id: batchId });
    }

    async prepareSubjectData(oldSubjects: Subject[], newBatchId: number, termId: number): Promise<Partial<Subject>[]> {
        return oldSubjects.map((subject) => ({
            ...subject,
            batch_id: newBatchId,
            // term_id: termId,
            created_at: new Date(),
            updated_at: new Date(),
        }));
    }

    async createBulk(newSubjects: Partial<Subject>[]) {
        console.log("🚀 🚀 <<<<<< createBulk Data newSubjects>>>>>>", newSubjects);
        const savedSubject = await this.subjectRepository.save(newSubjects);
        return savedSubject;
    }

    async getSubjectByQuery(query: any) {
        return await this.subjectRepository.find({ where: query });
    }

    async bulkUpdate(data: Partial<Subject>[]) {
        return await this.subjectRepository.save(data);
    }

    async fetchDivisionSubjectByQuery(query: any) {
        return await this.divisionSubjectRepository.find({ where: query });
    }
}
