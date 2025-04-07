import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { Permission } from "../permissions/permissions.entity";
import { CreatePermissionDto } from "../permissions/dtos/create-permissions.dto";
import { UpdatePermissionDto } from "../permissions/dtos/update-permission.dto";

@Injectable()
export class PermissionsService {
    constructor(
        @InjectRepository(Permission)
        private readonly permissionRepository: Repository<Permission>
    ) {}

    async isExist(query: any): Promise<Permission | null> {
        return await this.permissionRepository.findOne({ where: query });
    }

    async getPermissionsWithoutPagination(query: any) {
        const list = await this.permissionRepository.find({
            where: query,
            relations: ["module", "role"],
            select: {
                module: {
                    id: true,
                    module_name: true,
                    module_name_show: true,
                },

                role: {
                    id: true,
                    role_name: true,
                    role_name_show: true,
                },
            },
        });
        return list;
    }
    async createPermission(createPermissionDto: CreatePermissionDto): Promise<Permission> {
        const permission = this.permissionRepository.create(createPermissionDto);
        return await this.permissionRepository.save(permission);
    }

    async getPermissions(reqQuery: any): Promise<{
        totalCount: number;
        totalPages: number;
        currentPage: number;
        list: Permission[];
    }> {
        const page = reqQuery.page ? parseInt(reqQuery.page, 10) : 1;
        const limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : 10;
        const offset = (page - 1) * limit;
        // const sortField = reqQuery.sortField || "id";
        // const sortDirection = reqQuery.sort && reqQuery.sort.toLowerCase() === "desc" ? "DESC" : "ASC";

        const sortField = "id";
        const sortDirection = "asc";

        let queryObject = {};

        if (reqQuery && reqQuery.role_id && reqQuery.role_id !== "undefined" && reqQuery.role_id !== "") {
            queryObject["role_id"] = reqQuery.role_id;
        }
        if (reqQuery && reqQuery.module_id && reqQuery.module_id !== "undefined" && reqQuery.module_id !== "") {
            queryObject["module_id"] = reqQuery.module_id;
        }

        queryObject["deleted_at"] = IsNull();

        const [list, totalCount] = await this.permissionRepository.findAndCount({
            where: queryObject,
            relations: ["role", "module"],
            order: { [sortField]: sortDirection },
            select: {
                role: {
                    id: true,
                    role_name: true,
                    role_name_show: true,
                },
                module: {
                    id: true,
                    module_name: true,
                    module_name_show: true,
                },
            },
            skip: reqQuery.page ? offset : null,
            take: reqQuery.page ? limit : null,
            withDeleted: false,
        });

        const totalPages = Math.ceil(totalCount / limit);

        return {
            totalCount,
            totalPages,
            currentPage: page,
            list,
        };
    }

    async getPermissionById(id: number): Promise<Permission> {
        const permission = await this.permissionRepository.findOne({ where: { id: id } });

        if (!permission) {
            throw new NotFoundException(`Permission with ID ${id} not found`);
        }
        return permission;
    }

    async updatePermission(id: number, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
        const permission = await this.getPermissionById(id);
        Object.assign(permission, updatePermissionDto);
        return await this.permissionRepository.save(permission);
    }

    async deletePermission(id: number) {
        const permission = await this.getPermissionById(id);
        await this.permissionRepository.softRemove(permission);
    }

    async savePermissions(permissions: CreatePermissionDto[]) {
        try {
            await this.permissionRepository.save(permissions);
        } catch (error) {
            throw new Error("Error saving permissions: " + error.message);
        }
    }
}
