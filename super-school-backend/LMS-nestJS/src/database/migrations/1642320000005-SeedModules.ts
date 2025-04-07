import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedModules1642320000005 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const currentTimestamp = new Date().toISOString();

        await queryRunner.query(`
            INSERT INTO modules (
                id,
                module_name,
                module_name_show,
                created_at,
                updated_at,
                deleted_at,
                created_by,
                deleted_by,
                updated_by
            ) VALUES
                (1, 'Dashboard', 'dashboard', NOW(), NOW(), NULL, 1, NULL, NULL),
                (2, 'Schools', 'schools', NOW(), NOW(), NULL, 1, NULL, NULL),
                (3, 'Admin', 'admin', NOW(), NOW(), NULL, 1, NULL, NULL),
                (4, 'Teachers', 'teachers', NOW(), NOW(), NULL, 1, NULL, NULL),
                (5, 'Learners', 'learners', NOW(), NOW(), NULL, 1, NULL, NULL),
                (6, 'Parents', 'parents', NOW(), NOW(), NULL, 1, NULL, NULL),
                (7, 'Department Admin', 'department_admin', NOW(), NOW(), NULL, 1, NULL, NULL),
                (8, 'Assessments', 'assessments', NOW(), NOW(), NULL, 1, NULL, NULL),
                (9, 'Grading Process', 'grading_process', NOW(), NOW(), NULL, 1, NULL, NULL),
                (10, 'Manual Review', 'manual_review', NOW(), NOW(), NULL, 1, NULL, NULL),
                (11, 'Marked Answer Scripts', 'marked_answer_scripts', NOW(), NOW(), NULL, 1, NULL, NULL),
                (12, 'Result Dashboard', 'result_dashboard', NOW(), NOW(), NULL, 1, NULL, NULL),
                (13, 'Report Card', 'report_card', NOW(), NOW(), NULL, 1, NULL, NULL),
                (14, 'Practice Exercises', 'practice_exercises', NOW(), NOW(), NULL, 1, NULL, NULL),
                (15, 'Lesson Plans', 'lesson_plans', NOW(), NOW(), NULL, 1, NULL, NULL),
                (16, 'Study Materials', 'study_materials', NOW(), NOW(), NULL, 1, NULL, NULL),
                (17, 'Reports Management', 'reports_management', NOW(), NOW(), NULL, 1, NULL, NULL),
                (18, 'Calendar', 'calendar', NOW(), NOW(), NULL, 1, NULL, NULL),
                (19, 'Exam Timetable', 'exam_timetable', NOW(), NOW(), NULL, 1, NULL, NULL),
                (20, 'General Settings', 'general_settings', NOW(), NOW(), NULL, 1, NULL, NULL)
            ON CONFLICT (id) DO UPDATE SET
                module_name = EXCLUDED.module_name,
                module_name_show = EXCLUDED.module_name_show,
                updated_at = NOW(),
                deleted_at = EXCLUDED.deleted_at,
                created_by = EXCLUDED.created_by,
                deleted_by = EXCLUDED.deleted_by,
                updated_by = EXCLUDED.updated_by;

            -- Reset the sequence to the max id + 1
            SELECT setval('modules_id_seq', (SELECT MAX(id) FROM modules));
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM modules 
            WHERE id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20);
            
            -- Reset the sequence
            ALTER SEQUENCE modules_id_seq RESTART WITH 1;
        `);
    }
}
