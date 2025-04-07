import { DataSource } from "typeorm";
import { getBaseConfig } from "./base-data-source";
import { AddGeneralSetting1642320000008 } from "./migrations/1642320000008-SeedGeneralSetting";

export const RolesDataSource = new DataSource({
    ...getBaseConfig(),
    migrations: [AddGeneralSetting1642320000008],
});
