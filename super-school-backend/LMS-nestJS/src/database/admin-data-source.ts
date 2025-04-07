import { DataSource } from "typeorm";
import { getBaseConfig } from "./base-data-source";
import { AddAdminUser1737026150587 } from "./migrations/1737026150587-AddAdminUser";

export const RolesDataSource = new DataSource({
    ...getBaseConfig(),
    migrations: [AddAdminUser1737026150587],
});
