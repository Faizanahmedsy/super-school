import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedProvinces1642320000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO provinces (id, province_name, country, created_at, updated_at, deleted_at) 
            VALUES 
                (1, 'Gujarat', 'India', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, null),
            ON CONFLICT (id) DO UPDATE 
            SET 
                province_name = EXCLUDED.province_name,
                country = EXCLUDED.country,
                updated_at = EXCLUDED.updated_at;
        `);

        // Reset the sequence
        await queryRunner.query(`
            SELECT setval('provinces_id_seq', (SELECT MAX(id) FROM provinces));
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM provinces WHERE id IN (1,2,3,4,5,6,7,8,9);`);
    }
}
