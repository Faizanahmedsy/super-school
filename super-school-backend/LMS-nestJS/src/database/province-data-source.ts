// import { DataSource } from "typeorm";
// import { SeedProvinces1642320000001 } from "./migrations/1642320000001-SeedProvinces";

// export const ProvinceDataSource = new DataSource({
//     type: "postgres",
//     host: "localhost",
//     port: 5432,
//     username: "developer",
//     password: "developer",
//     database: "nsc",
//     synchronize: false,
//     logging: true,
//     entities: ["dist/**/*.entity{.ts,.js}"],
//     migrations: [SeedProvinces1642320000001],
// });

import { DataSource } from "typeorm";
import { getBaseConfig } from "./base-data-source";
import { SeedProvinces1642320000001 } from "./migrations/1642320000001-SeedProvinces";

export const ProvinceDataSource = new DataSource({
    ...getBaseConfig(),
    migrations: [SeedProvinces1642320000001],
});
