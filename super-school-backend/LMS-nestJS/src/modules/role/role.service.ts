import { forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Role } from "./role.entity";
import { CreateRoleDto } from "./dtos/create-role.dto";

import { PermissionsService } from "../permissions/permissions.service";

import { UsersService } from "../users/user.service";
import { ModuleService } from "../module/module.service";

@Injectable()
export class RoleService {
    constructor(
        @InjectRepository(Role)
        private roleRepository: Repository<Role>,
        private permissionsService: PermissionsService,
        @Inject(forwardRef(() => UsersService)) private readonly userService: UsersService,
        private moduleService: ModuleService
    ) {}

    async getRoles(reqQuery: any): Promise<{
        totalCount: number;
        totalPages: number;
        currentPage: number;
        list: Role[];
    }> {
        const page = reqQuery.page ? parseInt(reqQuery.page, 10) : 1;
        const limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : 10;
        const sort = reqQuery.sort && reqQuery.sort.toLowerCase() === "desc" ? "DESC" : "ASC"; // Default to 'ASC'

        const offset = (page - 1) * limit;

        const [roles, totalCount] = await this.roleRepository.findAndCount({
            where: {},
            order: {
                id: sort,
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
    async findRolesByNames(names: string[]): Promise<Role[]> {
        return this.roleRepository.find({
            where: { role_name: In(names) },
        });
    }
    async getRoleByInfo(obj: any) {
        return await this.roleRepository.findOne({ where: obj });
    }

    async createRoleWithPermissions(createRoleDto: CreateRoleDto, userId: number) {
        const { role_name, role_name_show } = createRoleDto;

        const newRole = this.roleRepository.create({
            role_name,
            role_name_show,
        });

        const savedRole = await this.roleRepository.save(newRole);

        const modules = await this.moduleService.findMoule();

        const creator = await this.userService.findById(userId);

        if (!creator) {
            throw new NotFoundException("Creator not found");
        }

        const permissions = modules.map((module) => ({
            role_id: savedRole.id,
            module_id: module.id,
            allow: {
                add: false,
                edit: false,
                delete: false,
                view: false,
            },
            created_by: creator.id,
        }));

        try {
            await this.permissionsService.savePermissions(permissions);
        } catch (error) {
            throw new Error("Failed to save permissions: " + error.message);
        }

        return savedRole;
    }

    async find(conditions: any): Promise<Role[]> {
        const where: any = {}; // This will hold the query filters

        // Dynamically adding filters to the where clause
        if (conditions.role_name) {
            where.role_name = In(conditions.role_name); // Role names are passed here
        }

        if (conditions.role_id) {
            where.id = In(conditions.role_id); // Role IDs are passed here
        }

        // Fetch roles based on the dynamic conditions
        return this.roleRepository.find({
            where: where,
        });
    }
}
