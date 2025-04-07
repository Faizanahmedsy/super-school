import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, In, Repository } from "typeorm";
import { Term } from "./term.entity";
import { CreateTermDto } from "../term/dtos/create-term.dto";
import { UpdateTermDto } from "../term/dtos/update-term.dto";
import { DivisionSubject } from "../division_subject/divisionsubject.entity";

@Injectable()
export class TermService {
    constructor(
        @InjectRepository(Term)
        private termRepository: Repository<Term>,

        @InjectRepository(DivisionSubject)
        private divisionSubjectRepository: Repository<DivisionSubject>
    ) {}

    async createTerm(createTermDto: CreateTermDto) {
        const newTerm = this.termRepository.create(createTermDto);
        return await this.termRepository.save(newTerm);
    }

    async findTermByName(term_name: string): Promise<Term | null> {
        return this.termRepository.findOne({ where: { term_name } });
    }

    async updateTermBatchId(termId: number, newBatchId: number): Promise<void> {
        await this.termRepository.update(termId, { batch_id: newBatchId });
    }

    async createDefaultTerms(batch_id: number, school_id: number, createdBy: number) {
        const terms = ["Term 1", "Term 2", "Term 3", "Term 4"].map((term_name, index) => {
            return this.termRepository.create({
                term_name,
                batch_id,
                school_id,
                status: index === 0,
                created_by: createdBy,
            });
        });
        return await this.termRepository.save(terms);
    }

    async getTermByBatchId(batchId: number): Promise<Term | null> {
        return await this.termRepository.findOne({
            where: { batch_id: batchId },
        });
    }
    async updateTermStatus(updatedTerm: { id: number; batch_id: number; status: boolean; updated_by: number }): Promise<Term> {
        // Find the term by ID and update its status
        const term = await this.termRepository.findOne({ where: { id: updatedTerm.id } });

        if (!term) {
            throw new Error(`Term with ID ${updatedTerm.id} not found`);
        }

        // Update the term's status and other fields
        term.batch_id = updatedTerm.batch_id;
        term.status = updatedTerm.status;
        term.updated_by = updatedTerm.updated_by;
        term.updated_at = new Date(); // Set the update timestamp

        // Save the updated term to the database
        return await this.termRepository.save(term);
    }

    // async getTerms(reqQuery: any) {
    //     const page = reqQuery.page ? parseInt(reqQuery.page, 10) : 1;
    //     const limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : 10;
    //     const offset = (page - 1) * limit;
    //     const sortDirection = reqQuery.sort && reqQuery.sort.toLowerCase() === "desc" ? "DESC" : "ASC";
    //     let queryObject = { deleted_at: null };
    //     if (reqQuery && reqQuery.search && reqQuery.search != "undefined" && reqQuery.search != "") {
    //         queryObject["term_name"] = ILike(`%${reqQuery.search}%`);
    //     }
    //     if (reqQuery && reqQuery.school_id && reqQuery.school_id != "undefined" && reqQuery.school_id != "") {
    //         queryObject["school_id"] = reqQuery.school_id;
    //     }
    //     if (reqQuery && reqQuery.batch_id && reqQuery.batch_id != "undefined" && reqQuery.batch_id != "") {
    //         queryObject["batch_id"] = reqQuery.batch_id;
    //     }
    //     const [terms, totalCount] = await this.termRepository.findAndCount({
    //         where: queryObject,
    //         order: { created_at: sortDirection },
    //         skip: reqQuery.page ? offset : null,
    //         take: reqQuery.page ? limit : null,
    //     });

    //     const totalPages = Math.ceil(totalCount / limit);

    //     return {
    //         totalCount,
    //         totalPages,
    //         currentPage: page,
    //         list: terms,
    //     };
    // }

    async getTerms(reqQuery: any) {
        const page = reqQuery.page ? parseInt(reqQuery.page, 10) : 1;
        const limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : 10;
        const offset = (page - 1) * limit;
        const sortDirection = reqQuery.sort && reqQuery.sort.toLowerCase() === "desc" ? "DESC" : "ASC";

        // Build query object
        let queryObject: any = { deleted_at: null };

        if (reqQuery && reqQuery.search && reqQuery.search != "undefined" && reqQuery.search != "") {
            queryObject["term_name"] = ILike(`%${reqQuery.search}%`);
        }
        if (reqQuery && reqQuery.school_id && reqQuery.school_id != "undefined" && reqQuery.school_id != "") {
            queryObject["school_id"] = reqQuery.school_id;
        }
        if (reqQuery && reqQuery.batch_id && reqQuery.batch_id != "undefined" && reqQuery.batch_id != "") {
            queryObject["batch_id"] = reqQuery.batch_id;
        }

        // Add teacher_id filter if provided
        // if (reqQuery.teacher_id && reqQuery.teacher_id != "undefined" && reqQuery.teacher_id != "") {
        //     queryObject["divisionSubjects.teacher_id"] = reqQuery.teacher_id;
        // }
        let termIds: number[] | undefined;

        if (reqQuery.teacher_id && reqQuery.teacher_id !== "undefined" && reqQuery.teacher_id !== "") {
            // Fetch term IDs where teacher_id matches
            const classSubjects = await this.divisionSubjectRepository.find({
                select: ["term_id"], // Select only term IDs
                where: {
                    teacher_id: reqQuery.teacher_id,
                },
            });
            termIds = classSubjects.map((cs) => cs.term_id);
        }

        if (termIds && termIds.length > 0) {
            queryObject.id = In(termIds);
        } else if (reqQuery.teacher_id) {
            // If no grades match the teacher_id, return empty result
            return {
                totalCount: 0,
                totalPages: 0,
                currentPage: page,
                list: [],
            };
        }
        console.log("🚀 ~ file: term.service.ts:128 ~ TermService ~ getTerms ~ queryObject:", queryObject);
        const [terms, totalCount] = await this.termRepository.findAndCount({
            where: queryObject,
            relations: ["divisionSubjects"], // Include related data for teacher validation
            order: { created_at: sortDirection },
            skip: reqQuery.page ? offset : null,
            take: reqQuery.page ? limit : null,
        });

        const sortedTerms = terms.sort((a, b) => {
            // Extract numeric parts from the term field
            const numA = a.term_name.match(/\d+/)?.[0]; // Get the first match or undefined
            const numB = b.term_name.match(/\d+/)?.[0]; // Get the first match or undefined

            // Parse the numbers; if undefined, treat as 0 for safety
            const numberA = numA ? parseInt(numA, 10) : 0;
            const numberB = numB ? parseInt(numB, 10) : 0;

            return numberA - numberB; // Sort in ascending order
        });

        if (reqQuery && reqQuery.student_count && reqQuery.student_count != "undefined" && reqQuery.student_count == "true") {
            // await Promise.all(
            //     sortedTerms.map(async (term) => {
            //         let divisionSubject: any = await this.divisionSubjectRepository
            //             .createQueryBuilder("divisionSubject")
            //             .where("divisionSubject.term_id = :termId", { termId: term.id })
            //             .loadRelationCountAndMap("divisionSubject.studentCount", "divisionSubject.students", "student")
            //             .getOne();
            //         if (divisionSubject) {
            //             term["studentCount"] = divisionSubject.studentCount; // This will be the count of students
            //         } else {
            //             term["studentCount"] = 0;
            //         }
            //         return term;
            //     })
            // );
        }

        // const termWithStudentCount = sortedTerms.map((term) => ({
        //     ...term,
        //     studentCount: term.students?.length || 0,
        // }));

        const totalPages = Math.ceil(totalCount / limit);

        return {
            totalCount,
            totalPages,
            currentPage: page,
            list: sortedTerms,
        };
    }

    async getTermById(id: number) {
        const term = await this.termRepository.findOne({ where: { id } });
        if (!term) {
            throw new NotFoundException(`Term with ID ${id} not found`);
        }
        return term;
    }

    async updateTerm(id: number, updateTermDto: UpdateTermDto) {
        const term = await this.getTermById(id);
        Object.assign(term, updateTermDto);
        return await this.termRepository.save(term);
    }

    async deleteTerm(id: number): Promise<void> {
        const term = await this.termRepository.findOne({ where: { id } });
        if (!term) {
            throw new NotFoundException(`Term with ID ${id} not found`);
        }

        term.deleted_at = new Date();
        await this.termRepository.save(term);
    }

    // In term.service.ts
    // Update the method to fetch all terms for a batch
    async getTermsByBatchId(batchId: number): Promise<Term[]> {
        return this.termRepository.find({
            where: { batch_id: batchId },
        });
    }

    async getTermByBatchIdAndTermId(batchId: number, id: number): Promise<Term | null> {
        console.log(`🚀 Searching for term with Batch ID: ${batchId} and Term ID: ${id}`);

        // Ensure batchId and id are numbers
        const batchIdNum = Number(batchId);
        const idNum = Number(id);

        if (isNaN(batchIdNum) || isNaN(idNum)) {
            console.error(`❌ Invalid batchId or id passed: batchId=${batchId}, id=${id}`);
            return null;
        }

        // Log the query parameters
        console.log(`🔍 Querying for term with Batch ID: ${batchIdNum} and Term ID: ${idNum}`);

        const term = await this.termRepository.findOne({
            where: { batch_id: batchIdNum, id: idNum },
        });

        // Log the result of the query
        if (term) {
            console.log(`✅ Found existing term:`, term);
        } else {
            console.log(`❌ No term found with Batch ID ${batchIdNum} and Term ID ${idNum}`);
        }

        return term;
    }

    // async getTermByBatchIdAndTermId(batchId: number, id: number): Promise<Term | null> {
    //     console.log(`Searching for term with Batch ID: ${batchId} and Term ID: ${id}`);

    //     const term = await this.termRepository.findOne({
    //         where: { batch_id: batchId, id: id }, // Use `findOne` for a single result
    //     });

    //     // Log the result of the query
    //     if (term) {
    //         console.log(`Found existing term:`, term);
    //     } else {
    //         console.log(`No term found with Batch ID ${batchId} and Term ID ${id}`);
    //     }

    //     return term;
    // }

    async getAllTerms(): Promise<Term[]> {
        return await this.termRepository.find({
            where: { deleted_at: null },
        });
    }

    async prepareTermData(oldTerms: Term[], newBatchId: number): Promise<Partial<Term>[]> {
        return oldTerms.map((term) => ({
            ...term,
            batch_id: newBatchId,
            created_at: new Date(),
            updated_at: new Date(),
        }));
    }

    async createBulk(newTerms: Partial<Term>[]) {
        console.log("🚀 🚀 <<<<<< createBulk Data >>>>>>", newTerms);
        const savedTerm = await this.termRepository.save(newTerms);
        return savedTerm;
    }

    async getTermByObject(query: any) {
        return await this.termRepository.find(query);
    }
}
