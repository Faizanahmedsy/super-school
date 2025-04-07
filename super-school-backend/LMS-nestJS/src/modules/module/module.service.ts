import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Module as ModuleEntity } from "./module.entity";
import { CreateModuleDto } from "./dtos/create-module.dto";
import { UpdateModuleDto } from "./dtos/update-module.dto";
import { Role } from "../role/role.entity";
import { Permission } from "../permissions/permissions.entity";
import { RoleModule } from "../role/role.module"; // Import RoleModule
import { PermissionsModule } from "../permissions/permissions.module";

@Injectable()
export class ModuleService {
    constructor(
        @InjectRepository(ModuleEntity)
        private moduleRepository: Repository<ModuleEntity>,

        @InjectRepository(Role)
        private roleRepository: Repository<Role>,
        @InjectRepository(Permission)
        private permissionRepository: Repository<Permission>
    ) {}

    async getModules(reqQuery: any): Promise<ModuleEntity[]> {
        const page = reqQuery.page ? parseInt(reqQuery.page, 10) : 1;
        const limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : 10;
        const sort = reqQuery.sort && reqQuery.sort.toLowerCase() === "desc" ? "DESC" : "ASC"; // Default to 'ASC' if not provided

        const offset = (page - 1) * limit;

        return await this.moduleRepository.find({
            order: {
                id: sort, // Sort by `id`, or change to another field like `module_name` if needed
            },
            skip: offset, // Pagination offset
            take: limit, // Pagination limit
        });
    }

    async createModuleWithPermissions(createModuleDto: CreateModuleDto, createdBy: number): Promise<ModuleEntity> {
        const module = this.moduleRepository.create(createModuleDto);

        console.log("🚀 ~ file: module.service.ts:44 ~ ModuleService ~ createModuleWithPermissions ~ module:", module);
        let data = await this.moduleRepository.save(module);

        console.log("🚀 ~ file: module.service.ts:46 ~ ModuleService ~ createModuleWithPermissions ~ data:", data);

        const roles = await this.roleRepository.find();
        for (const role of roles) {
            if (role.role_name.toLowerCase() === "super_admin") {
                continue;
            }

            const permission = this.permissionRepository.create({
                role_id: role.id,
                module_id: module.id,
                allow: {
                    add: false,
                    edit: false,
                    delete: false,
                    view: false,
                },
                created_by: createdBy,
            });

            console.log("🚀 ~ file: module.service.ts:64 ~ ModuleService ~ createModuleWithPermissions ~ permission:", permission);
            await this.permissionRepository.save(permission);
        }

        return module;
    }

    async findModuleByName(moduleName: string): Promise<ModuleEntity | null> {
        return this.moduleRepository.findOne({
            where: { module_name: moduleName },
        });
    }

    async findMoule() {
        return await this.moduleRepository.find();
    }

    async getRoleWiseModules(): Promise<any> {
        const roles = await this.roleRepository.find();
        const modules = await this.moduleRepository.find({ where: { deleted_at: null } }); // Only active modules
        const result = {};

        for (const role of roles) {
            const rolePermissions = [];

            for (const module of modules) {
                const permission = await this.permissionRepository.findOne({
                    where: { role_id: role.id, module_id: module.id, deleted_at: null }, // Only active permissions
                });

                if (permission) {
                    rolePermissions.push({
                        module_name: module.module_name,
                        permissions: permission.allow,
                    });
                }
            }

            result[role.role_name.toLowerCase()] = rolePermissions;
        }

        return result;
    }

    async deleteModule(moduleId: number): Promise<ModuleEntity | null> {
        const module = await this.moduleRepository.findOne({ where: { id: moduleId } });

        if (!module) {
            return null;
        }

        await this.permissionRepository.update({ module_id: moduleId }, { deleted_at: new Date() });

        module.deleted_at = new Date();
        await this.moduleRepository.save(module);

        return module;
    }

    async findModuleByNameShow(moduleName: string): Promise<ModuleEntity | null> {
        return this.moduleRepository.findOne({
            where: { module_name_show: moduleName },
        });
    }
}
