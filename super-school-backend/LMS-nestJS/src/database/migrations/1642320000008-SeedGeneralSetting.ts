import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGeneralSetting1642320000008 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO general_setting (id,theme_primary_color,theme_secondary_color,support_email,created_at) 
            VALUES
             (1,'#92400e','#fff7ed','support@super_school.in',CURRENT_TIMESTAMP);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove the admin user in case of rollback
        await queryRunner.query(`
            DELETE FROM general_setting
            WHERE id IN (1);
        `);
    }
}
