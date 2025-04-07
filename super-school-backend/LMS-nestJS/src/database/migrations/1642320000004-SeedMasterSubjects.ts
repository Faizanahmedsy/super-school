import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedMasterSubjects1642320000004 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO master_subject (
                id,
                grade_number,
                subject_code,
                subject_name,
                is_language,
                created_at,
                updated_at
            ) VALUES
                -- Grade 10
                ('35','10', '1335200', 'Arabic Second Additional Language', true, NOW(), NOW()),
                ('36','10', '1335203', 'French Second Additional Language', true, NOW(), NOW()),
                ('37','10', '1335206', 'German Home Language', true, NOW(), NOW()),
                ('38','10', '1335209', 'German Second Additional Language', true, NOW(), NOW()),
                ('39','10', '1335212', 'Gujarati Home Language', true, NOW(), NOW()),
                ('40','10', '1335215', 'Gujarati First Additional Language', true, NOW(), NOW()),
                ('41','10', '1335218', 'Gujarati Second Additional Language', true, NOW(), NOW()),
                ('42','10', '1335221', 'Hebrew Second Additional Language', true, NOW(), NOW()),
                ('43','10', '1335224', 'Hindi Home Language', true, NOW(), NOW()),
                ('44','10', '1335227', 'Hindi First Additional Language', true, NOW(), NOW()),
                ('45','10', '1335230', 'Hindi Second Additional Language', true, NOW(), NOW()),
                ('46','10', '1335233', 'Italian Second Additional Language', true, NOW(), NOW()),
                ('47','10', '1335236', 'Latin Second Additional Language', true, NOW(), NOW()),
                ('48','10', '1335239', 'Portuguese Home Language', true, NOW(), NOW()),
                ('49','10', '1335242', 'Portuguese First Additional Language', true, NOW(), NOW()),
                ('50','10', '1335245', 'Portuguese Second Additional Language', true, NOW(), NOW()),
                ('51','10', '1335577', 'Serbian Home Language*', true, NOW(), NOW()),
                ('52','10', '1335580', 'Serbian Second Additional Language*', true, NOW(), NOW()),
                ('53','10', '1335248', 'Spanish Second Additional Language', true, NOW(), NOW()),
                ('54','10', '1335251', 'Tamil Home Language', true, NOW(), NOW()),
                ('55','10', '1335254', 'Tamil First Additional Language', true, NOW(), NOW()),
                ('56','10', '1335257', 'Tamil Second Additional Language', true, NOW(), NOW()),
                ('57','10', '1335260', 'Telegu Home Language', true, NOW(), NOW()),
                ('58','10', '1335263', 'Telegu First Additional Language', true, NOW(), NOW()),
                ('59','10', '1335266', 'Telugu Second Additional Language', true, NOW(), NOW()),
                ('60','10', '1335269', 'Urdu Home Language', true, NOW(), NOW()),
                ('61','10', '1335272', 'Urdu First Additional Language', true, NOW(), NOW()),
                ('62','10', '1335275', 'Urdu Second Additional Language', true, NOW(), NOW()),
                ('63','10', '1036100', 'Equine Studies', false, NOW(), NOW()),
                ('64','10', '1236100', 'Maritime Economics', false, NOW(), NOW()),
                ('65','10', '1536100', 'Nautical Science', false, NOW(), NOW()),
                ('66','10', '1635112', 'Sport and Exercise Science', false, NOW(), NOW()),
            
            ON CONFLICT (subject_code) DO UPDATE SET 
                grade_number = EXCLUDED.grade_number,
                subject_name = EXCLUDED.subject_name,
                is_language = EXCLUDED.is_language,
                updated_at = NOW();
        `);

        // Reset the sequence to the max id + 1
        await queryRunner.query(`
            SELECT setval('master_subject_id_seq', (SELECT MAX(id) FROM master_subject));
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM master_subject 
            WHERE subject_code IN (
                -- Grade 10
                '1335201', '1335204', '1335207', '1335210', '1335213', '1335216', 
                '1335219', '1335222', '1335225', '1335228', '1335231', '1335234', 
                '1335237', '1335240', '1335243', '1335246', '1335578', '1335581', 
                '1335249', '1335252', '1335255', '1335258', '1335261', '1335264', 
                '1335267', '1335270', '1335273', '1335276', '1036101', '1236101', 
                '1536101', '1635113',
            );
        `);
    }
}
