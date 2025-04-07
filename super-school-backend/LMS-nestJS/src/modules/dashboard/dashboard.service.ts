import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Student } from "../student/student.entity";
import { Teacher } from "../teacher/teacher.entity";
import { Institute } from "../institutes/institutes.entity";

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(Student)
        private studentRepository: Repository<Student>,

        @InjectRepository(Teacher)
        private teacherRepository: Repository<Teacher>,

        @InjectRepository(Institute)
        private instituteRepository: Repository<Institute>
    ) {}

    async getTotalStudents(): Promise<number> {
        const count = await this.studentRepository.count();

        return count;
    }

    async getTotalTeachers(): Promise<number> {
        const count = await this.teacherRepository.count();
        return count;
    }

    async getTotalInstitutes(): Promise<number> {
        const count = await this.instituteRepository.count();
        return count;
    }

    async getTotalStudentsByInstitute(instituteId: number): Promise<number> {
        const totalStudents = await this.studentRepository.count({
            where: { institute: { id: instituteId } },
        });
        console.log("getTotalStudentsByInstitutegetTotalStudentsByInstitute", totalStudents);
        return totalStudents;
    }

    async getTotalTeachersByInstitute(instituteId: number): Promise<number> {
        const totalTeachers = await this.teacherRepository.count({
            where: { institute: { id: instituteId } },
        });

        return totalTeachers;
    }
    async getTotalStudentsByParent(parentId: number): Promise<number> {
        return await this.studentRepository.count({ where: {} });
    }
}
