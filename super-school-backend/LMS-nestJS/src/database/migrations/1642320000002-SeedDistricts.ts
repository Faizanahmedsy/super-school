// src/database/migrations/1642320000002-SeedDistricts.ts

import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedDistricts1642320000002 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO districts (id, district_name, created_at, updated_at, deleted_at, province_id) 
            VALUES 
                (1, 'Ahmedabad', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 1)
            ON CONFLICT (id) DO UPDATE 
            SET 
                district_name = EXCLUDED.district_name,
                province_id = EXCLUDED.province_id,
                updated_at = EXCLUDED.updated_at;
        `);

        // Reset the sequence
        await queryRunner.query(`
            SELECT setval('districts_id_seq', (SELECT MAX(id) FROM districts));
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM districts WHERE id <= 52;`);
    }
}
