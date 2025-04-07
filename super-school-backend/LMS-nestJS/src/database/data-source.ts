import { DataSource } from "typeorm";
import { PostgresConfigService } from "../config/postgres/config.service";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "developer",
    password: "developer",
    database: "nsc",
    synchronize: false,
    logging: true,
    entities: ["dist/**/*.entity{.ts,.js}"],
    migrations: ["dist/database/migrations/*.js"],
    subscribers: [],
});
