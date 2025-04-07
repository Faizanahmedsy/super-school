import { DataSource } from "typeorm";
import { getBaseConfig } from "./base-data-source";
import { SeedMasterSubjects1642320000004 } from "./migrations/1642320000004-SeedMasterSubjects";

export const MasterSubjectDataSource = new DataSource({
    ...getBaseConfig(),
    migrations: [SeedMasterSubjects1642320000004],
});
