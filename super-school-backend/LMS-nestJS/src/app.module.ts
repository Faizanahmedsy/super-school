import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
// import { MailerModule } from "@nestjs-modules/mailer";
// import { EjsAdapter } from "@nestjs-modules/mailer/dist/adapters/ejs.adapter";
import { UsersModule } from "./modules/users/user.module";
import { AuthModule } from "./modules/auth/auth.module";
import { PostgresDatabaseProviderModule } from "./providers/database/provider.module";
import { PostgresConfigService } from "./config/postgres/config.service";
import { AppConfigModule } from "./config/app/config.module";
import { PostgresConfigModule } from "./config/postgres/config.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { BatchModule } from "./modules/batch/batch.module";
import { RoleModule } from "./modules/role/role.module";
import { ExamModule } from "./modules/exam/exam.module";
import { PermissionsModule } from "./modules/permissions/permissions.module";
import { LanguageMiddleware } from "./middleware/language.middleware";
import { AppConfigService } from "./config/app/config.service";
import { ModuleModule } from "./modules/module/module.module";
import { InstituteModule } from "./modules/institutes/institutes.module";
import { StateModule } from "./modules/state/state.module";
import { State } from "./modules/state/state.entity";
import { City } from "./modules/city/city.entity";
import { CityModule } from "./modules/city/city.module";
import { SubjectModule } from "./modules/subject/subject.module";
// import { S3Service } from "./services/s3.service";
// import { AwsModule } from "./services/aws.module";
import { TeacherModule } from "./modules/teacher/teacher.module";
import { ParentModule } from "./modules/parents/parents.module";
import { GradeModule } from "./modules/grade/grade.module";
import { StudentModule } from "./modules/student/student.module";
import { AdminModule } from "./modules/admin/admin.module";
import { Division } from "./modules/division/division.entity";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { DivisionSubjectModule } from "./modules/division_subject/divisionsubject.module";
// import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { DivisionModule } from "./modules/division/divison.module";
// import { UploadService } from "./modules/upload/upload.service";
// import { UploadModule } from "./modules/upload/upload.module";
import { GeneralSettingModule } from "./modules/general_setting/general-setting.module";
import { Admin } from "./modules/admin/admin.entity";
import { Batch } from "./modules/batch/batch.entity";
import { DivisionSubject } from "./modules/division_subject/divisionsubject.entity";
import { Grade } from "./modules/grade/grade.entity";
import { Institute } from "./modules/institutes/institutes.entity";
import { Parent } from "./modules/parents/parents.entity";
import { Permission } from "./modules/permissions/permissions.entity";
import { Role } from "./modules/role/role.entity";
import { Student } from "./modules/student/student.entity";
import { Subject } from "./modules/subject/subject.entity";
import { Teacher } from "./modules/teacher/teacher.entity";
import { User } from "./modules/users/user.entity";
import { TermModule } from "./modules/term/term.module";
import { MasterSubjectModule } from "./modules/master_subject/master-subject.module";
import { MasterSubject } from "./modules/master_subject/master-subject.entity";
import { OldQuestionPaperModule } from "./modules/old_question_paper/oldPaper.module";
import { EventModule } from "./modules/calendar_event/event.module";
import { NotificationModule } from "./modules/notification/notification.module";
import { AuditLogModule } from "./modules/audit_log/audit-log.module";
import { DepartmentUserModule } from "./modules/department_user/department_user.module";
import { AssessmentModule } from "./modules/assessment/assessment.module";
import { AssessmentSubjectModule } from "./modules/assessment_subjects/assessment_subjects.module";
import { StudentAnswerSheetModule } from "./modules/student_answer_sheet/student_answer_sheet.module";

import { DigitalMarkingsModule } from "./modules/digital_markings/digital_markings.module";
import { ManualMarkingLogModule } from "./modules/manual_marking_logs/manual_marking_logs.module";
import { LessonPlanModule } from "./modules/lesson_plans/lesson_plans.module";
import { StudyMaterialModule } from "./modules/study_materials/study_materials.module";
import { TimeTableModule } from "./modules/time_table/time_table.module";
import { SupportModule } from "./modules/support/support.module";
import { SchoolSetupModule } from "./modules/school_setup/school-setup.module";
import { SocketGateway } from "./modules/calendar_event/event.gateway";
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: [".env"],
        }),
        AppConfigModule,
        TypeOrmModule.forRootAsync({
            imports: [PostgresConfigModule, PostgresDatabaseProviderModule],
            useFactory: async (postgresConfigService: PostgresConfigService) => ({
                type: "postgres",
                host: postgresConfigService.db_host,
                port: postgresConfigService.db_port,
                username: postgresConfigService.db_username,
                password: postgresConfigService.db_password,
                database: postgresConfigService.db_name,
                autoLoadEntities: true,

                entities: [
                    State,
                    City,
                    Admin,
                    Batch,
                    Division,
                    DivisionSubject,
                    Grade,
                    Institute,
                    Parent,
                    Permission,
                    Role,
                    Student,
                    Subject,
                    Teacher,
                    User,
                    MasterSubject,
                ],
                synchronize: false,
                logging: false,
            }),
            inject: [PostgresConfigService],
        }),
        // MailerModule.forRoot({
        //     transport: {
        //         host: process.env.SMTP_HOST,
        //         port: parseInt(process.env.SMTP_PORT, 10),
        //         secure: JSON.parse(process.env.SMTP_SECURE || "false"),
        //         auth: {
        //             user: process.env.EMAIL_USER,
        //             pass: process.env.EMAIL_PASSWORD,
        //         },
        //     },
        //     defaults: {
        //         from: '"No Reply" <no-reply@super_school.in>',
        //     },
        //     template: {
        //         dir: process.cwd() + "/src/templates/",

        //         adapter: new EjsAdapter(),
        //         options: {
        //             strict: false,
        //         },
        //     },
        // }),
        UsersModule,
        AuthModule,
        BatchModule,
        RoleModule,
        ExamModule,
        PermissionsModule,
        ModuleModule,
        InstituteModule,
        StateModule,
        CityModule,
        SubjectModule,
        TeacherModule,
        ParentModule,
        GradeModule,
        DivisionModule,
        StudentModule,
        TermModule,
        EventModule,
        OldQuestionPaperModule,
        AdminModule,
        DashboardModule,
        DivisionSubjectModule,
        GeneralSettingModule,
        MasterSubjectModule,
        NotificationModule,
        AuditLogModule,
        DepartmentUserModule,
        AssessmentModule,
        AssessmentSubjectModule,
        StudentAnswerSheetModule,
        DigitalMarkingsModule,
        ManualMarkingLogModule,
        PostgresDatabaseProviderModule,
        LessonPlanModule,
        StudyMaterialModule,
        TimeTableModule,
        SupportModule,
        SchoolSetupModule,
    ],
    controllers: [AppController],
    providers: [AppService, AppConfigService, SocketGateway],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LanguageMiddleware).forRoutes("*");
    }
}
