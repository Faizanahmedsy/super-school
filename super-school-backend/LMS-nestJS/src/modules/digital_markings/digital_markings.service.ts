import { Injectable, NotFoundException, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DigitalMarking } from "./digital_markings.entity";
import { CreateDigitalMarkingDto } from "./dtos/create-digital-markings.dto";
import { UpdateDigitalMarkingDto } from "./dtos/update-digital-markings.dto";
import { Institute } from "../institutes/institutes.entity";

@Injectable()
export class DigitalMarkingService {
    constructor(
        @InjectRepository(DigitalMarking)
        private readonly digitalMarkingRepository: Repository<DigitalMarking>
    ) {}

    // async createDigitalMarking(createDigitalMarkingDto: CreateDigitalMarkingDto) {
    //     try {
    //         // Fetch the related Institute entity based on the school_id in the DTO
    //         const school = await this.digitalMarkingRepository.manager.findOne(Institute, {
    //             where: { id: createDigitalMarkingDto.school_id },
    //         });
    
    //         if (!school) {
    //             throw new NotFoundException(`Institute with ID ${createDigitalMarkingDto.school_id} not found`);
    //         }
    
    //         // Map the DTO to the DigitalMarking entity
    //         const newDigitalMarking = this.digitalMarkingRepository.create({
    //             ...createDigitalMarkingDto,
    //             school_id: school, // Assign the fetched Institute entity
    //         });
    
    //         // Save the entity to the database
    //         return await this.digitalMarkingRepository.save(newDigitalMarking);
    //     } catch (error) {
    //         console.error(error);
    //         throw new InternalServerErrorException("Failed to create digital marking");
    //     }
    // }
    

    async getDigitalMarkings(query: any): Promise<{ totalCount: number; totalPages: number; list: DigitalMarking[] }> {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const offset = (page - 1) * limit;
        const sortDirection = query.sort === "desc" ? "DESC" : "ASC";

        const [digitalMarkings, totalCount] = await this.digitalMarkingRepository.findAndCount({
            skip: offset,
            take: limit,
            order: { id: sortDirection },
        });

        return {
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            list: digitalMarkings,
        };
    }

    async getDigitalMarkingById(id: number): Promise<DigitalMarking> {
        const digitalMarking = await this.digitalMarkingRepository.findOne({ where: { id } });
        if (!digitalMarking) {
            throw new NotFoundException(`Digital Marking with ID ${id} not found`);
        }
        return digitalMarking;
    }

    async updateDigitalMarking(id: number, updateDigitalMarkingDto: UpdateDigitalMarkingDto): Promise<DigitalMarking> {
        const digitalMarking = await this.getDigitalMarkingById(id);
        Object.assign(digitalMarking, updateDigitalMarkingDto);
        return await this.digitalMarkingRepository.save(digitalMarking);
    }

    async deleteDigitalMarking(id: number): Promise<void> {
        const digitalMarking = await this.getDigitalMarkingById(id);
        await this.digitalMarkingRepository.remove(digitalMarking);
    }
}
