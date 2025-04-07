import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Support } from "./support.entity";
import { ILike, Repository } from "typeorm";
import { AddSupport } from "./dto/add-support.dto";
import { GeneralSettingService } from "../general_setting/general-setting.service";
import { EmailService } from "src/services/mail.service";
import * as handlebars from "handlebars";
import { join } from "path";
import * as fs from "fs";
import { UpdateSubjectDto } from "../subject/dtos/update-subject.dto";
@Injectable()
export class SupportService {
    constructor(
        @InjectRepository(Support)
        private supportRepository: Repository<Support>,
        private generalSettingServices: GeneralSettingService,
        private mailerService: EmailService
    ) {}

    async addAttachment(body: AddSupport): Promise<Support> {
        return await this.supportRepository.save(body);
    }

    async detail(query: any) {
        return await this.supportRepository.findOne({
            where: query,
            relations: ["institute", "creator"],
        });
    }

    async getList(reqQuery: any): Promise<{
        totalCount: number;
        totalPages: number;
        currentPage: number;
        list: any[];
    }> {
        const page = reqQuery.page ? parseInt(reqQuery.page, 10) : 1;
        const limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : 10;
        const offset = (page - 1) * limit;
        const sortOrder = reqQuery.sort === "desc" ? "DESC" : "ASC";

        const where: any = {
            deleted_at: null,
        };

        if (reqQuery?.search && reqQuery.search !== "") {
            where.email = ILike(`%${reqQuery.search}%`);
        }

        if (reqQuery?.school_id && reqQuery.school_id != "") {
            where.school_id = reqQuery.school_id;
        }

        if (reqQuery?.user_id && reqQuery.user_id != "") {
            where.user_id = reqQuery.user_id;
        }

        let [timeTable, totalCount] = await this.supportRepository.findAndCount({
            where,
            order: { created_at: sortOrder },
            relations: ["institute", "creator"],
            skip: offset,
            take: limit,
        });

        if (timeTable?.length) {
            timeTable = timeTable.map((data) => {
                if (data?.institute) {
                    data["institute_name"] = data.institute.school_name;
                    delete data.institute;
                }
                if (data?.creator) {
                    data["user_name"] = data.creator.user_name;
                    delete data.creator;
                }
                return data;
            });
        }
        const totalPages = Math.ceil(totalCount / limit);

        return {
            totalCount: totalCount,
            totalPages,
            currentPage: page,
            list: timeTable,
        };
    }

    async sendSupportRequestEmail(data: Partial<Support>) {
        try {
            let generalSetting = await this.generalSettingServices.getSetting();
            let supportEmail = process.env.SUPPORT_EMAIL;
            if (generalSetting) {
                supportEmail = generalSetting.support_email;
            }
            const context = {
                year: new Date().getFullYear(),
                role_name: data.role_name,
                school_name: data["school_name"],
                description: data.description,
                email: data.email,
                supportemail: supportEmail,
                logoPath: process.env.LOGO_SERVER_PATH,
                attachment: data.attachment,
            };

            const template = handlebars.compile(fs.readFileSync(join(__dirname, "../../../src/templates/support-email.hbs"), "utf8"));

            const html = template(context);

            const text = "";

            await this.mailerService.sendMail({
                email: supportEmail,
                subject: "Support Request Email",
                text: text,
                html: html,
                template: "support-request-email",
                context: context,
            });
        } catch (error) {
            console.error("sendWelComeEmail", error);
        }
    }

    async isExist(query: any) {
        return await this.supportRepository.findOne({ where: query });
    }

    async deleteEvent(support: Support) {
        support.deleted_at = new Date();
        await this.supportRepository.save(support);
        return true;
    }

    async updateData(data: Partial<UpdateSubjectDto>) {
        return await this.supportRepository.save(data);
    }
}
