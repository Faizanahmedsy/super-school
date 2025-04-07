import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Institute } from "../institutes/institutes.entity";
import { Logger } from "@nestjs/common";
import { GeneralSetting } from "./general-setting.entity";
interface UpdatedColorsResponse {
    themePrimaryColor?: string;
    themeSecondaryColor?: string;
    logo?: string;
}

interface UpdateLogo {
    logo?: null;
}
@Injectable()
export class GeneralSettingService {
    constructor(
        @InjectRepository(Institute)
        private instituteRepository: Repository<Institute>,

        @InjectRepository(GeneralSetting)
        private generalSettingRepository: Repository<GeneralSetting>
    ) {}

    async updateThemeColorForInstitute(instituteId: number, themePrimaryColor: string, themeSecondaryColor: string): Promise<boolean> {
        const institute = await this.instituteRepository.findOne({ where: { id: instituteId } });

        if (!institute) {
            return false;
        }

        await this.instituteRepository.update(instituteId, {
            themePrimaryColor,
            themeSecondaryColor,
        });

        return true;
    }

    async hasAdminSetColor(instituteId: number): Promise<boolean> {
        const institute = await this.instituteRepository.findOne({ where: { id: instituteId } });

        if (!institute) {
            return false;
        }

        return !!(institute.themePrimaryColor && institute.themeSecondaryColor);
    }

    async updateThemeColorForAllInstitutes(themePrimaryColor: string, themeSecondaryColor: string): Promise<boolean> {
        const institutes = await this.instituteRepository.find();

        const updates = institutes.map(async (institute) => {
            if (!institute.themePrimaryColor && !institute.themeSecondaryColor) {
                await this.instituteRepository.update(institute.id, {
                    themePrimaryColor,
                    themeSecondaryColor,
                });
            } else {
            }
        });

        await Promise.all(updates);
        return true;
    }

    async updateLogoForAllInstitutes(logoFilePath: string): Promise<boolean> {
        try {
            // Assuming you want to update the logo for all institutes in the system
            const institutes = await this.instituteRepository.find();
            for (const institute of institutes) {
                institute.logo = logoFilePath; // Assuming `logo` is a field in the Institute entity
                await this.instituteRepository.save(institute);
            }
            return true;
        } catch (error) {
            console.error("Error updating logo for all institutes:", error);
            return false;
        }
    }

    async getLogoPathForInstitute(instituteId: number): Promise<string | null> {
        const institute = await this.instituteRepository.findOne({ where: { id: instituteId } });
        if (institute && institute?.logo) {
            return institute.logo; // Assuming 'logo' field stores the file path
        }
        return null;
    }
    async getAllInstitutes(): Promise<Institute[]> {
        try {
            return await this.instituteRepository.find(); // Fetch all institutes from the database
        } catch (error) {
            throw new Error("Error fetching institutes: " + error.message);
        }
    }
    // Update the logo for a specific institute
    async updateLogoForInstitute(instituteId: number, logoFilePath: string): Promise<boolean> {
        const institute = await this.instituteRepository.findOne({ where: { id: instituteId } });
        if (!institute) {
            return false; // Institute not found
        }
        institute.logo = logoFilePath; // Update the logo field with the new file path
        await this.instituteRepository.save(institute);
        return true;
    }

    async updateInstituteData(instituteId: number, payload: UpdatedColorsResponse): Promise<boolean> {
        const institute = await this.instituteRepository.findOne({ where: { id: instituteId } });

        if (!institute) {
            return false;
        }

        if (!payload?.logo) {
            payload.logo = institute.logo;
        }
        await this.instituteRepository.update(instituteId, payload);

        return true;
    }

    async updateRecord(data: any) {
        let setting = await this.generalSettingRepository
            .createQueryBuilder("generalSetting")
            // .orderBy("generalSetting.createdAt", "ASC") // Optional ordering
            .getOne();
        console.log("🚀 ~ GeneralSettingService ~ updateRecord ~ setting:", setting);

        if (!setting) {
            // create new one
            console.log(data, "----------");
            setting = await this.generalSettingRepository.save(data);
            return setting;
        }
        let updatedPayload = { ...setting, ...data };
        let updated = await this.generalSettingRepository.update(setting.id, updatedPayload);
        if (updated) {
            return updatedPayload;
        }
        return null;
    }

    async getInstitute(id: number): Promise<Institute> {
        return await this.instituteRepository.findOne({ where: { id: id } }); // Fetch all institutes from the database
    }

    async getSetting() {
        return await this.generalSettingRepository
            .createQueryBuilder("generalSetting")
            // .orderBy("generalSetting.createdAt", "ASC") // Optional ordering
            .getOne();
    }

    async updateInstituteLogo(instituteId: number, payload: UpdateLogo): Promise<boolean> {
        await this.instituteRepository.update(instituteId, payload);
        return true;
    }
}
