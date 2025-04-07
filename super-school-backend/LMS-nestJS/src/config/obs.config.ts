import * as OBS from "esdk-obs-nodejs";
import { ConfigService } from "@nestjs/config";

/*
 *  OBS configuration
 */
export const createOBSClient = (configService: ConfigService): OBS => {
    return new OBS({
        access_key_id: configService.get<string>("HUAWEI_CLOUD_ACCESS_KEY"),
        secret_access_key: configService.get<string>("HUAWEI_CLOUD_SECRET_KEY"),
        server: configService.get<string>("HUAWEI_CLOUD_OBS_ENDPOINT"),
    });
};
