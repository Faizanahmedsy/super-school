import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { State } from "./state.entity";
import { CreateStateDto } from "../state/dtos/create-state.dto";
import { UpdateStateDto } from "../state/dtos/update-state.dto";

@Injectable()
export class StateService {
    constructor(
        @InjectRepository(State)
        private readonly stateRepository: Repository<State>
    ) {}

    async getAllStates(reqQuery: any): Promise<State[]> {
        const page = reqQuery.page ? parseInt(reqQuery.page, 10) : 1;
        const limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : 10;
        const offset = (page - 1) * limit;

        // Get the sort order from query param, default to ASC
        const sortDirection = reqQuery.sort && reqQuery.sort.toLowerCase() === "desc" ? "DESC" : "ASC";

        // Get the field to sort by from query param, default to 'name'
        const sortBy = reqQuery.sortBy || 'id';

        // Apply sorting and pagination
        return await this.stateRepository.find({
            skip: offset,
            take: limit,
            order: { [sortBy]: sortDirection }, // Dynamic sorting based on 'sortBy' and 'sort'
        });
    }
}
