import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, ILike, In } from "typeorm";
import { Institute } from "./institutes.entity";
import { CreateInstituteDto } from "../institutes/dtos/create-institutes.dto";
import { UpdateInstituteDto } from "../institutes/dtos/update-institutes.dto";
import { NotificationService } from "../notification/notification.service";
import { AdminService } from "../admin/admin.service";
import { Admin } from "../admin/admin.entity";
import { GeneralSetting } from "../general_setting/general-setting.entity";
@Injectable()
export class InstituteService {
    constructor(
        @InjectRepository(Institute)
        private readonly instituteRepository: Repository<Institute>,

        @InjectRepository(Admin)
        private readonly adminRepository: Repository<Admin>,

        @InjectRepository(GeneralSetting)
        private readonly generalSettingRepository: Repository<GeneralSetting>
    ) {}

    async isExist(query: any) {
        return await this.instituteRepository.findOne({ where: query });
    }

    async createInstitute(createInstituteDto: CreateInstituteDto): Promise<Institute> {
        const institute = this.instituteRepository.create(createInstituteDto);
        return await this.instituteRepository.save(institute);
    }

    async getAllInstitutes(): Promise<Institute[]> {
        return await this.instituteRepository.find({
            where: { deleted_at: null },
        });
    }

    async getInstituteById(id: number): Promise<Institute> {
        const institute = await this.instituteRepository.findOne({ where: { id: id } });
        if (!institute) {
            throw new NotFoundException(`Institute with ID ${id} not found`);
        }
        return institute;
    }

    async findById(id: number): Promise<Institute | null> {
        return this.instituteRepository.findOne({ where: { id: id } });
    }

    async getInstituteByInfo(obj: any): Promise<Institute> {
        const institute = await this.instituteRepository.findOne({ where: { id: obj } });
        if (!institute) {
            throw new NotFoundException(`Institute not found`);
        }
        return institute;
    }

    async updateInstitute(id: number, updateInstituteDto: UpdateInstituteDto): Promise<Institute> {
        const institute = await this.getInstituteById(id);
        Object.assign(institute, updateInstituteDto);
        return await this.instituteRepository.save(institute);
    }

    async deleteInstitute(id: number) {
        const institute = await this.getInstituteById(id);
        await this.instituteRepository.softDelete(id);
    }

    async getInstitutes(reqQuery: any): Promise<{
        totalCount: number;
        totalPages: number;
        currentPage: number;
        list: Institute[];
    }> {
        const page = reqQuery.page ? parseInt(reqQuery.page, 10) : 1;
        const limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : 10;

        const offset = (page - 1) * limit;

        const sortField = reqQuery.sortField || "created_at";
        const sortDirection = reqQuery.sort && reqQuery.sort.toLowerCase() === "desc" ? "DESC" : "ASC";

        const filterConditions: any = {};
        const searchConditions: any[] = [];
        if (reqQuery.search && reqQuery.search.trim() !== "") {
            const searchValue = `%${reqQuery.search.trim()}%`;
            searchConditions.push({ school_name: ILike(searchValue) });
            searchConditions.push({ EMIS_number: ILike(searchValue) });
        }
        if (reqQuery.district_id && reqQuery.district_id !== "undefined") {
            filterConditions.district_id = reqQuery.district_id;
        }
        if (reqQuery.province_id && reqQuery.province_id !== "undefined") {
            filterConditions.province_id = reqQuery.province_id;
        }
        if (reqQuery.setup && reqQuery.setup !== "undefined") {
            filterConditions.setup = reqQuery.setup;
        }

        const finalQuery = searchConditions.length > 0 ? searchConditions.map((condition) => ({ ...filterConditions, ...condition })) : filterConditions;
        const [institutes, totalCount] = await this.instituteRepository.findAndCount({
            where: finalQuery,
            relations: ["city", "state", "batches"],
            order: {
                [sortField]: sortDirection,
            },
            skip: reqQuery.page ? offset : null,
            take: reqQuery.page ? limit : null,
        });

        // let instituteArray: any = [];
        // const institutesWithActiveBatch = institutes.map(async (institute: any) => {
        //     const cur_batch = institute.batches?.find((batch) => batch.is_active === true);
        //     instituteArray.push(institute.id);
        //     institute.admin_count = await this.adminRepository.count({ where: { id: institute.id } });

        //     return {
        //         ...institute,
        //         batches: undefined,
        //         cur_batch,
        //     };
        // });

        // Process institutes with active batches
        const institutesWithActiveBatch = await Promise.all(
            institutes.map(async (institute: any) => {
                const cur_batch = institute.batches?.find((batch) => batch.is_active === true);
                institute.admin_count = await this.adminRepository.count({ where: { school_id: institute.id } });

                return {
                    ...institute,
                    batches: undefined,
                    cur_batch,
                };
            })
        );
        const totalPages = Math.ceil(totalCount / limit);

        return {
            totalCount,
            totalPages,
            currentPage: page,
            list: institutesWithActiveBatch,
        };
    }

    getUpdatedData(oldData: any, newData: any) {
        const updatedData: any = {
            old: {},
            new: {},
        };

        for (const key in newData) {
            if (newData[key] !== oldData[key]) {
                updatedData.old[key] = oldData[key];
                updatedData.new[key] = newData[key];
            }
        }

        return updatedData;
    }

    async findSetting() {
        return await this.generalSettingRepository
            .createQueryBuilder("generalSetting")
            // .orderBy("generalSetting.createdAt", "ASC") // Optional ordering
            .getOne();
    }
    async findSchoolForAuth(id: number): Promise<Institute | null> {
        return this.instituteRepository.findOne({
            where: { id: id },
            relations: ["city", "state"],
        });
    }
}
