// import { DataSource } from "typeorm";
// import { SeedDistricts1642320000002 } from "./migrations/1642320000002-SeedDistricts";

// export const DistrictDataSource = new DataSource({
//     type: "postgres",
//     host: "localhost",
//     port: 5432,
//     username: "developer",
//     password: "developer",
//     database: "nsc",
//     synchronize: false,
//     logging: true,
//     entities: ["dist/**/*.entity{.ts,.js}"],
//     migrations: [SeedDistricts1642320000002],
// });

import { DataSource } from "typeorm";
import { getBaseConfig } from "./base-data-source";
import { SeedDistricts1642320000002 } from "./migrations/1642320000002-SeedDistricts";

export const DistrictDataSource = new DataSource({
    ...getBaseConfig(),
    migrations: [SeedDistricts1642320000002],
});
