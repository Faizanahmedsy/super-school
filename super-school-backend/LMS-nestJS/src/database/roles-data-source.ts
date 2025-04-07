import { DataSource } from "typeorm";
import { getBaseConfig } from "./base-data-source";
import { SeedRoles1642320000003 } from "./migrations/1642320000003-SeedRoles";

export const RolesDataSource = new DataSource({
    ...getBaseConfig(),
    migrations: [SeedRoles1642320000003],
});
