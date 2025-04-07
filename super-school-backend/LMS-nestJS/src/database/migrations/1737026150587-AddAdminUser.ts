import { MigrationInterface, QueryRunner } from "typeorm";
import { hash } from "bcrypt";

export class AddAdminUser1737026150587 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Hash the password - using bcrypt with 10 salt rounds
        const hashedPassword = await hash("admin@2025", 10);

        await queryRunner.query(`
            INSERT INTO users (email,password,user_name,role_id,status,created_at,updated_at) 
            VALUES
             ('support@super_school.in','${hashedPassword}','Super Admin',1,'verified',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove the admin user in case of rollback
        await queryRunner.query(`
            DELETE FROM users 
            WHERE email = 'superadmin@gmail.com';
        `);
    }
}
