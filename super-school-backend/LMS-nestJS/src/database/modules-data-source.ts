import { DataSource } from "typeorm";
import { getBaseConfig } from "./base-data-source";
import { SeedModules1642320000005 } from "./migrations/1642320000005-SeedModules";

export const ModulesDataSource = new DataSource({
    ...getBaseConfig(),
    migrations: [SeedModules1642320000005],
});
