// src/database/migrations/1642320000002-SeedPermissions.ts

import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedPermissions1642320000006 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const currentTimestamp = new Date().toISOString();

        // Insert permissions
        await queryRunner.query(`
            INSERT INTO permissions (id, allow, created_at, updated_at, deleted_at, module_id, role_id, school_id, created_by, deleted_by, updated_by) 
            VALUES 
                (1, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 1, 2, NULL, 1, NULL, 1), 
                (2, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 1, 3, NULL, 1, NULL, 1),
                (3, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 1, 4, NULL, 1, NULL, 1),
                (4, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 1, 5, NULL, 1, NULL, 1),
                (5, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 1, 6, NULL, 1, NULL, 1),
                (6, '{"add": false, "edit": false, "view": false, "delete": false}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 2, 2, NULL, 1, NULL, 1), 
                (7, '{"add": false, "edit": false, "view": false, "delete": false}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 2, 3, NULL, 1, NULL, 1),
                (8, '{"add": false, "edit": false, "view": false, "delete": false}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 2, 4, NULL, 1, NULL, 1),
                (9, '{"add": false, "edit": false, "view": false, "delete": false}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 2, 5, NULL, 1, NULL, 1),
                (10, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 2, 6, NULL, 1, NULL, 1),
                (11, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 3, 2, NULL, 1, NULL, 1), 
                (12, '{"add": false, "edit": false, "view": false, "delete": false}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 3, 3, NULL, 1, NULL, 1),
                (13, '{"add": false, "edit": false, "view": false, "delete": false}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 3, 4, NULL, 1, NULL, 1),
                (14, '{"add": false, "edit": false, "view": false, "delete": false}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 3, 5, NULL, 1, NULL, 1),
                (15, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 3, 6, NULL, 1, NULL, 1),
                (16, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 4, 2, NULL, 1, NULL, 1),
                (17, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 4, 3, NULL, 1, NULL, 1),
                (18, '{"add": false, "edit": false, "view": false, "delete": false}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 4, 4, NULL, 1, NULL, 1),
                (19, '{"add": false, "edit": false, "view": false, "delete": false}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 4, 5, NULL, 1, NULL, 1),
                (20, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 4, 6, NULL, 1, NULL, 1),
                (21, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 5, 2, NULL, 1, NULL, 1),
                (22, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 5, 3, NULL, 1, NULL, 1),
                (23, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 5, 4, NULL, 1, NULL, 1),
                (24, '{"add": false, "edit": false, "view": false, "delete": false}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 5, 5, NULL, 1, NULL, 1),
                (25, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 5, 6, NULL, 1, NULL, 1),
                (26, '{"add": true, "edit": true, "view": true, "delete": true}',CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 6,	2, NULL, 1, NULL, 1),
                (27, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 6,	3, NULL, 1, NULL, 1),
                (28, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 6,	4, NULL, 1, NULL, 1),
                (29, '{"add": false, "edit": false, "view": false, "delete": false}',CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 6,	5, NULL, 1, NULL, 1),
                (30, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 6,	6, NULL, 1, NULL, 1),
                (31, '{"add": false, "edit": false, "view": false, "delete": false}', CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 7,	2, NULL, 1, NULL, 1),
                (32, '{"add": false, "edit": false, "view": false, "delete": false}',CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 7,	3, NULL, 1, NULL, 1),
                (33, '{"add": false, "edit": false, "view": false, "delete": false}',CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 7,	4, NULL, 1, NULL, 1),
                (34, '{"add": false, "edit": false, "view": false, "delete": false}',CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 7,	5, NULL, 1, NULL, 1),
                (35, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 7,	6, NULL, 1, NULL, 1),
                (36, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 8, 2, NULL, 1, NULL, 1), 
                (37, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 8, 3, NULL, 1, NULL, 1),
                (38, '{"add": false, "edit": false, "view": false, "delete": false}', CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 8,	4, NULL, 1, NULL, 1),
                (39, '{"add": false, "edit": false, "view": false, "delete": false}', CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 8,	5, NULL, 1, NULL, 1),
                (40, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 8,	6, NULL, 1, NULL, 1),
                (41, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 9, 2, NULL, 1, NULL, 1), 
                (42, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 9, 3, NULL, 1, NULL, 1),
                (43, '{"add": false, "edit": false, "view": false, "delete": false}',CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 9,	4, NULL, 1, NULL, 1),
                (44, '{"add": false, "edit": false, "view": false, "delete": false}',CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 9, 5, NULL, 1, NULL, 1),
                (45, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 9,	6, NULL, 1, NULL,1),
                (46, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 10, 2, NULL, 1, NULL,	1), 
                (47, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 10, 3, NULL, 1, NULL, 1),
                (48, '{"add": false, "edit": false, "view": false, "delete": false}',CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 10, 4, NULL, 1, NULL, 1),
                (49, '{"add": false, "edit": false, "view": false, "delete": false}',CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 10, 5, NULL, 1, NULL, 1),
                (50, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 10, 6, NULL, 1, NULL, 1),
                (51, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 11, 2, NULL, 1, NULL,1), 
                (52, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 11, 3, NULL, 1, NULL,1),
                (53, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 11, 4, NULL, 1, NULL, 1),
                (54, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 11, 5, NULL, 1, NULL, 1),
                (55, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 11, 6, NULL, 1, NULL, 1),
                (56, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 12, 2, NULL, 1, NULL, 1), 
                (57, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 12, 3, NULL, 1, NULL, 1),
                (58, '{"add": false, "edit": false, "view": false, "delete": false}',CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 12, 4, NULL, 1, NULL, 1),
                (59, '{"add": false, "edit": false, "view": false, "delete": false}',CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 12, 5, NULL, 1, NULL, 1),
                (60, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 12, 6, NULL, 1, NULL, 1),
                (61, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 13, 2, NULL, 1, NULL, 1), 
                (62, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 13, 3, NULL, 1, NULL, 1),
                (63, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 13, 4, NULL, 1, NULL, 1),
                (64, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 13, 5, NULL, 1, NULL, 1),
                (65, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 13, 6, NULL, 1, NULL, 1),
                (66, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 14, 2, NULL, 1, NULL, 1 ),
                (67, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 14, 3, NULL, 1, NULL, 1),
                (68, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 14, 4, NULL, 1, NULL, 1),
                (69, '{"add": true, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 14, 5, NULL,	1, NULL, 1),
                (70, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 14, 6, NULL, 1, NULL, 1),
                (71, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 15, 2, NULL, 1, NULL, 1), 
                (72, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 15, 3, NULL, 1, NULL, 1),
                (73, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 15, 4, NULL, 1, NULL, 1),
                (74, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 15, 5, NULL, 1, NULL, 1),
                (75, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 15, 6, NULL, 1, NULL, 1),
                (76, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 16, 2, NULL, 1, NULL, 1), 
                (77, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 16, 3, NULL, 1, NULL, 1),
                (78, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 16, 4, NULL, 1, NULL, 1),
                (79, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 16, 5, NULL, 1, NULL, 1),
                (80, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 16, 6, NULL, 1, NULL, 1),
                (81, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 17, 2, NULL, 1, NULL, 1), 
                (82, '{"add": false, "edit": false, "view": false, "delete": false}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 17, 3, NULL, 1, NULL,	1),
                (83, '{"add": false, "edit": false, "view": false, "delete": false}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 17, 4, NULL, 1, NULL, 1),
                (84, '{"add": false, "edit": false, "view": false, "delete": false}',CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 17, 5, NULL, 1, NULL, 1),
                (85, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 17, 6, NULL, 1, NULL, 1),
                (86, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 18, 2, NULL, 1, NULL, 1),
                (87, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 18, 3, NULL, 1, NULL, 1),
                (88, '{"add": true, "edit": true, "view": true, "delete": false}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 18, 4, NULL,	1, NULL, 1),
                (89, '{"add": true, "edit": true, "view": true, "delete": false}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 18, 5, NULL,	1, NULL, 1),
                (90, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 18, 6, NULL, 1, NULL, 1),
                (91, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 19, 2, NULL, 1, NULL, 1),
                (92, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 19, 3, NULL, 1, NULL, 1),
                (93, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 19, 4, NULL, 1, NULL,1),
                (94, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 19, 5, NULL, 1, NULL, 1),
                (95, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP,	CURRENT_TIMESTAMP, NULL, 19, 6, NULL, 1, NULL, 1),
                (96, '{"add": false, "edit": false, "view": true, "delete": false}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 20, 2, NULL, 1, NULL, 1), 
                (97, '{"add": false, "edit": false, "view": false, "delete": false}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 20, 3, NULL, 1, NULL, 1),
                (98, '{"add": false, "edit": false, "view": false, "delete": false}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 20, 4, NULL, 1, NULL, 1),
                (99, '{"add": false, "edit": false, "view": false, "delete": false}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 20, 5, NULL, 1, NULL, 1), 
                (100, '{"add": false, "edit": false, "view": false, "delete": false}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 20, 6, NULL, 1, NULL, 1),
                (101, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 1, 1, NULL, 1, NULL, 1),
                (102, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 2, 1, NULL, 1, NULL, 1),
                (103, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 3, 1, NULL, 1, NULL, 1),
                (104, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 4, 1, NULL, 1, NULL, 1),
                (105, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 5, 1, NULL, 1, NULL, 1),
                (106, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 6, 1, NULL, 1, NULL, 1),
                (107, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 7, 1, NULL, 1, NULL, 1),
                (108, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 8, 1, NULL, 1, NULL, 1),
                (109, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 9, 1, NULL, 1, NULL, 1),
                (110, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 10, 1, NULL, 1, NULL, 1),
                (111, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 11, 1, NULL, 1, NULL, 1),
                (112, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 12, 1, NULL, 1, NULL, 1),
                (113, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 13, 1, NULL, 1, NULL, 1),
                (114, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 14, 1, NULL, 1, NULL, 1),
                (115, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 15, 1, NULL, 1, NULL, 1),
                (116, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 16, 1, NULL, 1, NULL, 1),
                (117, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 17, 1, NULL, 1, NULL, 1),
                (118, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 18, 1, NULL, 1, NULL, 1),
                (119, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 19, 1, NULL, 1, NULL, 1),
                (120, '{"add": true, "edit": true, "view": true, "delete": true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 20, 1, NULL, 1, NULL, 1)
            ON CONFLICT (id) DO UPDATE 
            SET 
                allow = EXCLUDED.allow,
                updated_at = CURRENT_TIMESTAMP,
                module_id = EXCLUDED.module_id,
                role_id = EXCLUDED.role_id,
                school_id = EXCLUDED.school_id,
                updated_by = EXCLUDED.updated_by;
        `);

        // Reset the sequence to the max id + 1
        await queryRunner.query(`
            SELECT setval('permissions_id_seq', (SELECT MAX(id) FROM permissions));
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove the seeded permissions
        await queryRunner.query(`
            DELETE FROM permissions 
            WHERE id IN (
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 
                34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 
                68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101,
                102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120
            );
        `);
    }
}
