// src/database/migrations/1642320000001-SeedRoles.ts

import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedRoles1642320000003 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Insert roles
        await queryRunner.query(`
            INSERT INTO roles (id, role_name, role_name_show, created_at, updated_at) 
            VALUES 
                (1, 'super_admin', 'Super Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                (2, 'admin', 'Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                (3, 'teacher', 'Teacher', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                (4, 'parents', 'Parents', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                (5, 'student', 'Learner', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                (6, 'department_of_education', 'Department Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT (id) DO UPDATE 
            SET 
                role_name = EXCLUDED.role_name,
                role_name_show = EXCLUDED.role_name_show,
                updated_at = EXCLUDED.updated_at;
        `);

        // Reset the sequence to the max id + 1
        await queryRunner.query(`
            SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove the seeded roles
        await queryRunner.query(`
            DELETE FROM roles 
            WHERE id IN (1, 2, 3, 4, 5, 6);
        `);
    }
}
