import { DataSource } from "typeorm";
import { getBaseConfig } from "./base-data-source";
import { SeedPermissions1642320000006 } from "./migrations/1642320000006-SeedPermissions";

export const ModulesDataSource = new DataSource({
    ...getBaseConfig(),
    migrations: [SeedPermissions1642320000006],
});
