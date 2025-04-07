import { forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { UpdateStudyMaterialDto } from "./dtos/updateStudyMaterials.dto";
import { StudyMaterial } from "./study_materials.entity";
import { CreateStudyMaterialDto } from "./dtos/createStudyMaterials.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, In, Not, Repository } from "typeorm";
import { TeacherService } from "../teacher/teacher.service";
import { Student } from "../student/student.entity";

const isValidQueryValue = (value: any) => value && value !== "undefined" && value !== "";
@Injectable()
export class StudyMaterialService {
    constructor(
        @InjectRepository(StudyMaterial)
        private studyMaterialRepository: Repository<StudyMaterial>,

        @InjectRepository(Student)
        private studentRepository: Repository<Student>,

        @Inject(forwardRef(() => TeacherService))
        private teacherService: TeacherService
    ) {}

    /*
     *   Create new Study Material
     */
    async create(createStudyMaterialDto: CreateStudyMaterialDto) {
        const newDivisionSubject = this.studyMaterialRepository.create(createStudyMaterialDto);
        return await this.studyMaterialRepository.save(newDivisionSubject);
    }

    /*
     *   Check if the plan exists
     */
    async isExist(id: number): Promise<StudyMaterial | null> {
        return await this.studyMaterialRepository.findOne({ where: { id } });
    }

    /*
     *   Get list of Study Materials
     */
    async findAll(reqQuery?: any) {
        const page = reqQuery.page ? parseInt(reqQuery.page, 10) : 1;
        const limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : 10;
        const offset = (page - 1) * limit;
        const sortDirection = reqQuery.sort && reqQuery.sort.toLowerCase() === "desc" ? "DESC" : "ASC";
        const sortColumn = reqQuery.sortBy ? reqQuery.sortBy : "created_at"; // You can use other fields if specified in the query
        let queryObject = {};
        if (isValidQueryValue(reqQuery.grade_id)) {
            queryObject["grade_id"] = reqQuery.grade_id;
        }

        if (isValidQueryValue(reqQuery.master_subject_id)) {
            queryObject["master_subject_id"] = reqQuery.master_subject_id;
        }
        if (isValidQueryValue(reqQuery.teacher_id)) {
            queryObject["teacher_id"] = reqQuery.teacher_id;
        }
        if (isValidQueryValue(reqQuery.term_id)) {
            queryObject["term_id"] = reqQuery.term_id;
        }
        if (isValidQueryValue(reqQuery.batch_id)) {
            queryObject["batch_id"] = reqQuery.batch_id;
        }
        if (isValidQueryValue(reqQuery.subject_id)) {
            queryObject["subject_id"] = reqQuery.subject_id;
        }
        if (isValidQueryValue(reqQuery.school_id)) {
            queryObject["school_id"] = reqQuery.school_id;
        }

        if (isValidQueryValue(reqQuery.type)) {
            queryObject["type"] = reqQuery.type;
        }

        if (isValidQueryValue(reqQuery.search)) {
            queryObject["name"] = ILike(`%${reqQuery.search}%`);
        }

        if (isValidQueryValue(reqQuery.year)) {
            queryObject["year"] = ILike(`%${reqQuery.year}%`);
        }

        console.log("🚀 ~ file: study_materials.service.ts:84 ~ StudyMaterialService ~ findAll ~ queryObject:", queryObject);
        const [studyMaterial, totalCount] = await this.studyMaterialRepository.findAndCount({
            where: queryObject,
            relations: ["teacher", "grade", "master_subject", "term", "batch", "subject"],
            order: {
                [sortColumn]: sortDirection, // Dynamically use sortColumn and sortDirection
            },
            skip: reqQuery.page ? offset : null,
            take: reqQuery.page ? limit : null,
        });

        const totalPages = Math.ceil(totalCount / limit);
        return {
            totalCount,
            totalPages,
            currentPage: page,
            list: studyMaterial,
        };
    }

    /*
     *   Get study material details by Id
     */
    async findById(id: number): Promise<StudyMaterial> {
        const divisionSubject = await this.studyMaterialRepository.findOne({
            where: { id },
            relations: ["teacher", "grade", "master_subject", "term", "batch", "subject"],
        });
        if (!divisionSubject) {
            throw new NotFoundException(`DivisionSubject with ID ${id} not found`);
        }
        return divisionSubject;
    }

    /*
     *   Find all lessons plans by customrt querys
     */
    async customFindBuQuery(query) {
        const lessonPlan = await this.studyMaterialRepository.find(query);

        return lessonPlan;
    }

    async findUniqTeacher(query: any) {
        const lessonPlan = await this.studyMaterialRepository.find({
            where: {
                ...query.where,
                id: Not(query.excludeId), // Exclude the current ID
            },
        });

        return lessonPlan;
    }

    /*
     *   Delete a lessonPlans
     */
    async delete(id: number) {
        const lessonPlan = await this.findById(id);
        if (!lessonPlan) {
            throw new Error("lessonPlan not found");
        }

        lessonPlan.deleted_at = new Date();
        return await this.studyMaterialRepository.save(lessonPlan);
    }

    /*
     *   Update study material by id
     */
    async update(id: number, updateLessonPlanDto: UpdateStudyMaterialDto): Promise<StudyMaterial> {
        const updatedLessonPlan = await this.studyMaterialRepository.findOne({ where: { id } });
        Object.assign(updatedLessonPlan, updateLessonPlanDto);
        await this.studyMaterialRepository.save(updatedLessonPlan);
        return this.findById(id);
    }

    /*
     *   Insert student into lesson_plan_student
     */
    // async addStudent(lessonPlanId, studentIds) {
    //     const lessonPlanRepository = this.studyMaterialRepository;

    //     // Find the study material
    //     const lessonPlan = await lessonPlanRepository.findOne({
    //         where: { id: lessonPlanId },
    //         relations: ["students"],
    //     });

    //     if (!lessonPlan) {
    //         throw new Error("study material not found");
    //     }

    //     // Find the students
    //     const students = await this.studentRepository.findByIds(studentIds);

    //     if (!students.length) {
    //         throw new Error("No students found");
    //     }

    //     // Add students to the study material
    //     lessonPlan.student = [...lessonPlan.student, ...students];

    //     // Save the updated study material
    //     await lessonPlanRepository.save(lessonPlan);
    // }

    async getMappedStudents(lessonPlanId: number): Promise<Student[]> {
        return this.studentRepository
            .createQueryBuilder("student")
            .innerJoin("student.lessonPlans", "lessonPlans")
            .where("lessonPlans.id = :lessonPlanId", { lessonPlanId })
            .getMany();
    }

    async bulkInsert(reqData) {
        console.log("🚀 ~ file: study_materials.service.ts:201 ~ StudyMaterialService ~ bulkInsert ~ reqData:", reqData);
        await this.studyMaterialRepository.save(reqData);
    }
}
