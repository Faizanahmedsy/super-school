import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";
import { Admin } from "./admin.entity";
import { CreateAdminDto } from "./dtos/create-admin.dto";
import { UpdateAdminDto } from "./dtos/update-admin.dto";
import { Institute } from "../institutes/institutes.entity";

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(Admin)
        private adminRepository: Repository<Admin>,

        @InjectRepository(Institute)
        private instituteRepository: Repository<Institute>
    ) {}

    async isExist(query: any) {
        return await this.adminRepository.findOne({ where: query });
    }

    async createAdmin(createAdminDto: CreateAdminDto) {
        const newAdmin = this.adminRepository.create(createAdminDto);
        return await this.adminRepository.save(newAdmin);
    }

    async getAdmins(reqQuery: any): Promise<{
        totalCount: number;
        totalPages: number;
        currentPage: number;
        list: any[];
    }> {
        const page = reqQuery.page ? parseInt(reqQuery.page, 10) : 1;
        const limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : 10;
        const sortOrder = reqQuery.sort && reqQuery.sort.toLowerCase() === "asc" ? "ASC" : "DESC";

        const offset = (page - 1) * limit;

        const sortField = reqQuery.sortField || "created_at";
        const filterConditions: any = {};
        const searchConditions: any[] = [];
        if (reqQuery.search && reqQuery.search.trim() !== "") {
            const searchValue = `%${reqQuery.search.trim()}%`;
            searchConditions.push({ first_name: ILike(searchValue) });
            searchConditions.push({ last_name: ILike(searchValue) });
        }
        if (reqQuery && reqQuery.school_id && reqQuery.school_id !== "undefined" && reqQuery.school_id !== "") {
            filterConditions.school_id = reqQuery.school_id;
        }
        const finalQuery = searchConditions.length > 0 ? searchConditions.map((condition) => ({ ...filterConditions, ...condition })) : filterConditions;
        const [admins, totalCount] = await this.adminRepository.findAndCount({
            where: finalQuery,
            order: {
                [sortField]: sortOrder,
            },
            skip: reqQuery.page ? offset : null,
            take: reqQuery.page ? limit : null,
            relations: ["institute", "institute.city", "institute.state"],
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                mobile_number: true,
                gender: true,
                profile_image: true,
                created_at: true,
                school_admin_user_id: true,
                role_id: true,
                school_id: true,
                institute: {
                    id: true,
                    school_name: true,
                    EMIS_number: true,
                },
            },
        });

        const totalPages = Math.ceil(totalCount / limit);

        // const list = admins.map((admin) => ({
        //     id: admin.id,
        //     first_name: admin.first_name,
        //     last_name: admin.last_name,
        //     email: admin.email,
        //     mobile_number: admin.mobile_number,
        //     gender: admin.gender,
        //     date_of_birth: admin.date_of_birth,
        //     profile_image: admin.profile_image ? admin.profile_image : null,
        //     school_admin_user_id: admin.school_admin_user_id,
        //     role_id: admin.role_id,
        //     school_id: admin.school_id,
        //     created_by: admin.created_by,
        //     updated_by: admin.updated_by,
        //     deleted_by: admin.deleted_by,
        //     created_at: admin.created_at,
        //     updated_at: admin.updated_at,
        //     deleted_at: admin.deleted_at,

        //     institute: {
        //         id: admin.institute?.id,
        //         school_name: admin.institute?.school_name,
        //         district_id: admin.institute?.district_id,
        //         province_id: admin.institute?.province_id,
        //         school_type: admin.institute?.school_type,
        //         medium_of_instruction: admin.institute?.medium_of_instruction,
        //         EMIS_number: admin.institute?.EMIS_number,
        //         address: admin.institute?.address,
        //         location_type: admin.institute?.location_type,
        //         contact_number: admin.institute?.contact_number,
        //         contact_person: admin.institute?.contact_person,
        //         contact_email: admin.institute?.contact_email,
        //         themePrimaryColor: admin.institute?.themePrimaryColor,
        //         themeSecondaryColor: admin.institute?.themeSecondaryColor,
        //         max_users: admin.institute?.max_users,
        //         current_users: admin.institute?.current_users,
        //         created_by: admin.institute?.created_by,
        //         updated_by: admin.institute?.updated_by,
        //         deleted_by: admin.institute?.deleted_by,
        //         setup: admin.institute?.setup,
        //         created_at: admin.institute?.created_at,
        //         updated_at: admin.institute?.updated_at,
        //         deleted_at: admin.institute?.deleted_at,
        //         state: admin.institute?.state
        //             ? { id: admin.institute.state.id, name: admin.institute.state.province_name, country: admin.institute.state.country }
        //             : null,
        //         city: admin.institute?.city
        //             ? { id: admin.institute.city.id, name: admin.institute.city.district_name, state_id: admin.institute.city.province_id }
        //             : null,
        //     },
        // }));

        return {
            totalCount,
            totalPages,
            currentPage: page,
            list: admins,
        };
    }

    async getAdminById(id: number) {
        return await this.adminRepository.findOne({
            where: { id },
            relations: ["institute", "institute.state", "institute.city"],
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                mobile_number: true,
                gender: true,
                profile_image: true,
                date_of_birth: true,
                school_admin_user_id: true,
                role_id: true,
                school_id: true,
                institute: {
                    id: true,
                    school_name: true,
                    EMIS_number: true,
                },
            },
        });
    }
    async getAdminByObj(obj: any) {
        return await this.adminRepository.findOne({ where: obj });
    }
    async updateAdmin(id: number, updateAdminDto: UpdateAdminDto) {
        const admin = await this.getAdminById(id);
        Object.assign(admin, updateAdminDto);
        return await this.adminRepository.save(admin);
    }

    async deleteAdmin(id: number) {
        const admin = await this.getAdminById(id);
        if (!admin) {
            throw new NotFoundException(`Admin with ID ${id} not found`);
        }
        return await this.adminRepository.softRemove(admin);
    }
    async getAdminForEvent(obj: any) {
        return await this.adminRepository.find({ where: obj });
    }
}
