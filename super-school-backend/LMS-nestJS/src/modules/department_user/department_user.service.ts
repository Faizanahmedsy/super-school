import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Department_USER } from "./department_user.entity";
import { CreateDepartmentUserDto } from "./dtos/create-department-user.dto";
import { UpdateDepartmentUserDto } from "./dtos/update-department-user.dto";

@Injectable()
export class DepartmentUserService {
    constructor(
        @InjectRepository(Department_USER)
        private departmentUserRepository: Repository<Department_USER>
    ) {}

    async createDepartmentUser(createDepartmentUserDto: CreateDepartmentUserDto): Promise<Department_USER> {
        const departmentUser = this.departmentUserRepository.create(createDepartmentUserDto);
        return this.departmentUserRepository.save(departmentUser);
    }

    async AllDepartmentUser(reqQuery: any): Promise<{
        totalCount: number;
        totalPages: number;
        currentPage: number;
        list: any[];
    }> {
        const page = reqQuery.page ? parseInt(reqQuery.page, 10) : 1;
        const limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : 10;
        const sortOrder = reqQuery.sort && reqQuery.sort.toLowerCase() === "asc" ? "ASC" : "DESC";

        const offset = (page - 1) * limit;
        const queryObject = { deleted_at: null };
        const sortField = reqQuery.sortField || "created_at";
        const [departmentUsers, totalCount] = await this.departmentUserRepository.findAndCount({
            where: queryObject,
            order: {
                [sortField]: sortOrder,
            },
            skip: reqQuery.page ? offset : null,
            take: reqQuery.page ? limit : null,
            relations: ["city", "state", "role"],
        });

        const totalPages = Math.ceil(totalCount / limit);
        const list = departmentUsers.map((user) => ({
            ...user,
            role_name: user.role ? user.role.role_name : null,
        }));
        return {
            totalCount,
            totalPages,
            currentPage: page,
            list: departmentUsers,
        };
    }

    async findOne(id: number): Promise<Department_USER> {
        const departmentUser = await this.departmentUserRepository.findOne({
            where: { id },
            relations: ["city", "state", "role"],
        });
        if (!departmentUser) {
            throw new NotFoundException(`Department User with id ${id} not found`);
        }
        return departmentUser;
    }
    async getDepartmentByObj(obj: any): Promise<Department_USER> {
        const departmentUser = await this.departmentUserRepository.findOne({
            where: obj,
            relations: ["city", "state", "role"],
        });
        if (!departmentUser) {
            return null;
        }
        return departmentUser;
    }
    async updateDepartmentUser(id: number, updateDepartmentUserDto: UpdateDepartmentUserDto): Promise<Department_USER> {
        const departmentUser = await this.getDepartmentUserById(id);
        let updatedPayload = Object.assign(departmentUser, updateDepartmentUserDto);
        return this.departmentUserRepository.save(updatedPayload);
    }

    async deleteDepartmentUser(id: number) {
        const departmentUser = await this.getDepartmentUserById(id);
        if (!departmentUser) {
            throw new NotFoundException(`Admin with ID ${id} not found`);
        }
        departmentUser.deleted_at = new Date();
        return await this.departmentUserRepository.softRemove(departmentUser);
    }

    async isExist(query: any): Promise<Department_USER> {
        return await this.departmentUserRepository.findOne({ where: query });
    }

    async getDepartmentUserById(id: number) {
        return await this.departmentUserRepository.findOne({ where: { id } });
    }
}
