import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Not, Repository } from "typeorm";
import { Batch } from "./batch.entity";
import { CreateBatchDto } from "../batch/dtos/create-batch.dto";
import { UpdateBatchDto } from "../batch/dtos/update-batch.dto";
import { TermService } from "../term/term.service";
import { AuditLogService } from "../audit_log/audit-log.service";

@Injectable()
export class BatchService {
    constructor(
        @InjectRepository(Batch)
        private batchRepository: Repository<Batch>,
        private termService: TermService,
        private auditLogService: AuditLogService
    ) {}

    async updateBatchActiveStatus(batchId: number, isActive: boolean): Promise<void> {
        await this.batchRepository.update(batchId, { is_active: isActive });
    }
    async getActiveBatch() {
        return await this.batchRepository.findOne({ where: { is_active: true } });
    }

    async isExist(query: any) {
        return await this.batchRepository.findOne({ where: query });
    }

    async findBatchById(id: number): Promise<Batch | undefined> {
        return this.batchRepository.findOne({ where: { id } });
    }

    async findBatchByName(start_year: number, school_id: number): Promise<Batch | null> {
        return this.batchRepository.findOne({ where: { start_year: start_year, school_id: school_id } });
    }
    async createBatch(createBatchDto: CreateBatchDto, createdBy: number) {
        const newBatch = this.batchRepository.create(createBatchDto);
        const savedBatch = await this.batchRepository.save(newBatch);

        let terms = await this.termService.createDefaultTerms(savedBatch.id, createBatchDto.school_id, createdBy);
        return { ...savedBatch, terms: terms };
    }

    async getBatch(reqQuery: any): Promise<{
        totalCount: number;
        totalPages: number;
        currentPage: number;
        list: Batch[];
    }> {
        const page = reqQuery.page ? parseInt(reqQuery.page, 10) : 1;
        const limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : 10;

        const offset = (page - 1) * limit;

        const sortField = reqQuery.sortField || "created_at";
        const sortDirection = reqQuery.sort && reqQuery.sort.toLowerCase() === "desc" ? "DESC" : "ASC";
        let queryObject = {};
        if (reqQuery && reqQuery.search && reqQuery.search != "undefined" && reqQuery.search != "") {
            queryObject["batch_name"] = ILike(`%${reqQuery.search}%`);
        }
        if (reqQuery && reqQuery.school_id && reqQuery.school_id != "undefined" && reqQuery.school_id != "") {
            queryObject["school_id"] = reqQuery.school_id;
        }

        const [roles, totalCount] = await this.batchRepository.findAndCount({
            where: queryObject,
            relations: ["institute"],
            select: {
                institute: {
                    id: true,
                    school_name: true,
                },
            },
            order: {
                [sortField]: sortDirection,
            },
            skip: reqQuery.page ? offset : null,
            take: reqQuery.page ? limit : null,
        });

        const totalPages = Math.ceil(totalCount / limit);

        return {
            totalCount,
            totalPages,
            currentPage: page,
            list: roles,
        };
    }

    async getBatches() {
        return await this.batchRepository.find();
    }

    async getBatchById(id: number) {
        const batch = await this.batchRepository.findOne({ where: { id } });
        if (!batch) {
            throw new NotFoundException(`Batch with ID ${id} not found`);
        }
        return batch;
    }
    // In your BatchService
    async getBatchActiveById(batch_id: number) {
        // Assuming 'is_active' is the field that marks if a batch is active
        const batch = await this.batchRepository.findOne({
            where: { id: batch_id, is_active: true },
        });

        if (!batch) {
            throw new Error(`No active batch found with ID ${batch_id}`);
        }

        return batch;
    }

    async getBatchByQuery(query: unknown) {
        const batch = await this.batchRepository.findOne({ where: query });
        return batch;
    }

    async deactivateBatch(batchId: number): Promise<void> {
        // Logic to deactivate the batch (e.g., updating the status of the batch)
        const batch = await this.batchRepository.findOne({
            where: { id: batchId },
        });
        if (!batch) {
            throw new Error("Batch not found");
        }
        batch.is_active = false; // or any logic to mark it as inactive
        await this.batchRepository.save(batch);
    }
    // async deactivateBatch(batchId: number): Promise<void> {
    //     await this.batchRepository.update(batchId, { is_active: false });
    // }

    // async activateBatch(id: number): Promise<void> {
    //     // Logic to activate the batch (e.g., setting the batch status to true)
    //     const batch = await this.batchRepository.findOne({
    //         where: { id: id },
    //     });
    //     if (!batch) {
    //         throw new Error("Batch not found");
    //     }
    //     batch.is_active = true; // or any logic to mark it as active
    //     await this.batchRepository.save(batch);
    // }
    // async activateBatch(batchId: number): Promise<void> {
    //     await this.batchRepository.update(batchId, { is_active: true });
    // }

    async activateBatch(id: number): Promise<void> {
        try {
            // Fetch the batch by ID
            const batch = await this.batchRepository.findOne({
                where: { id: id },
            });

            // If batch doesn't exist, throw an error
            if (!batch) {
                throw new Error(`Batch with ID ${id} not found`);
            }

            // Check if the batch is already active
            if (batch.is_active) {
                console.log(`Batch with ID ${id} is already active.`);
                return; // No need to activate if it's already active
            }

            // Update batch to active without losing existing data
            batch.is_active = true; // Set the batch to active

            // Save the batch with updated status (is_active)
            await this.batchRepository.save(batch);
            console.log(`Batch with ID ${id} has been activated.`);
        } catch (error) {
            console.error("Error in activating batch:", error);
            throw new Error(`Error activating batch with ID ${id}: ${error.message}`);
        }
    }

    async updateBatch(id: number, updateBatchDto: UpdateBatchDto) {
        const batch = await this.getBatchById(id);
        Object.assign(batch, updateBatchDto);
        return await this.batchRepository.save(batch);
    }

    async deleteBatch(id: number): Promise<void> {
        const batch = await this.getBatchById(id);
        if (!batch) {
            throw new NotFoundException(`Batch with ID ${id} not found`);
        }

        const terms = await this.termService.getTermsByBatchId(batch.id);
        for (const term of terms) {
            await this.termService.deleteTerm(term.id);
        }

        await this.batchRepository.softRemove(batch);
    }

    getUpdatedData(oldData: any, newData: any) {
        const updatedData: any = {
            old: {},
            new: {},
        };

        // Compare fields between old and new data
        for (const key in newData) {
            if (newData[key] !== oldData[key]) {
                updatedData.old[key] = oldData[key];
                updatedData.new[key] = newData[key];
            }
        }

        return updatedData;
    }

    async findByQuery(query: any) {
        return await this.batchRepository.findOne({ where: query });
    }

    async getPreviousActiveBatch(batchId: number) {
        console.log("Getting previous active batch for batchId:", batchId);
        const currentActiveBatch = await this.batchRepository.findOne({
            where: { id: batchId },
        });

        if (!currentActiveBatch) {
            console.log(`No active batch found with ID ${batchId}`);
            throw new NotFoundException(`No active batch found with ID ${batchId}`);
        }

        const previousActiveBatch = await this.batchRepository.findOne({
            where: { school_id: currentActiveBatch.school_id, id: Not(batchId), is_active: true },
        });

        console.log("Previous active batch:", previousActiveBatch);
        return previousActiveBatch;
    }

    async getBatchesByQuery(query: unknown) {
        const batch = await this.batchRepository.find({ where: query });
        return batch;
    }

    async updateByQuery(payload: any) {
        return await this.batchRepository.save(payload);
    }
}
