import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { City } from "./city.entity";
import { CreateCityDto } from "./dtos/create-city.dto";
import { UpdateCityDto } from "./dtos/update-city.dto";

@Injectable()
export class CityService {
    constructor(
        @InjectRepository(City)
        private readonly cityRepository: Repository<City>
    ) {}

    async getAllCities(queryParams: any): Promise<City[]> {
        const page = queryParams.page ? parseInt(queryParams.page, 10) : 1;
        const limit = queryParams.limit ? parseInt(queryParams.limit, 10) : 10;
        const offset = (page - 1) * limit;
        const sortOrder = queryParams.sort === "desc" ? "DESC" : "ASC"; // Default to "ASC"

        // Sorting by id, you can change this if you want to sort by other fields
        return await this.cityRepository.find({
            skip: offset,
            take: limit,
            order: { id: sortOrder }, // Sort by `id`
        });
    }

    async getCitiesByStateId(state_id: number): Promise<City[]> {
        const city = await this.cityRepository.find({
            where: { state: { id: state_id } },
        });
        if (!city.length) {
            throw new NotFoundException(`No cities found for state ID ${state_id}`);
        }
        return city;
    }
}
