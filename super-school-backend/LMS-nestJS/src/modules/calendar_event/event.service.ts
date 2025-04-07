import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Not, Repository } from "typeorm";
import { Event } from "./event.entity";
import { CreateEventDto } from "../calendar_event/dtos/create-event.dto";
import { UpdateEventDto } from "../calendar_event/dtos/update-event.dto";
import { Division } from "../division/division.entity";
import { DivisionService } from "../division/division.service";
import { NotificationService } from "../notification/notification.service";
import { SocketGateway } from "./event.gateway";
import { Grade } from "../grade/grade.entity";
import { Institute } from "../institutes/institutes.entity";
import { User } from "../users/user.entity";
import { CreateMultiEventDto } from "./dtos/create-multi-event.dto";
import { Student } from "../student/student.entity";
import { DivisionSubject } from "../division_subject/divisionsubject.entity";
import { Teacher } from "../teacher/teacher.entity";
import { ModuleService } from "../module/module.service";
import { TimeTable } from "../time_table/time_table.entity";

@Injectable()
export class EventService {
    constructor(
        @InjectRepository(Event)
        private eventRepository: Repository<Event>,
        @InjectRepository(Institute)
        private readonly instituteRepository: Repository<Institute>,
        @InjectRepository(Division)
        private readonly divisionRepository: Repository<Division>,
        @InjectRepository(Grade)
        private readonly gradeRepository: Repository<Grade>,
        @InjectRepository(Student)
        private readonly studentRepository: Repository<Student>,
        @InjectRepository(DivisionSubject)
        private readonly divisionSubjectRepository: Repository<DivisionSubject>,
        @InjectRepository(Teacher)
        private readonly teacherRepository: Repository<Teacher>,
        @InjectRepository(TimeTable)
        private readonly timeTableRepository: Repository<TimeTable>,

        private divisionService: DivisionService,
        private notificationService: NotificationService,
        private moduleServices: ModuleService,
        private readonly socketGateway: SocketGateway
    ) {}

    async createEvent(createEventDto: CreateEventDto) {
        const { class_id, division_id } = createEventDto;

        if (!class_id && !division_id) {
            throw new Error("Either class_id (grade) or division_id must be provided.");
        }

        // if (class_id && division_id) {
        //     throw new Error("Only one of class_id (grade) or division_id can be provided at a time.");
        // }

        let grade = null;
        let division = null;

        if (class_id) {
            grade = await this.gradeRepository.findOne({
                where: { id: class_id },
            });

            if (!grade) {
                throw new Error("Grade not found for the provided class_id.");
            }
        }

        if (division_id) {
            division = await this.divisionRepository.findOne({
                where: { id: division_id },
            });

            if (!division) {
                throw new Error("Division not found for the provided division_id.");
            }
        }

        const newEvent = this.eventRepository.create({
            ...createEventDto,
            grade,
            division,
        });

        const savedEvent = await this.eventRepository.save(newEvent);

        let module = await this.moduleServices.findModuleByNameShow("calendar");
        // await this.notificationService.createNotification({
        //     title: `Event created: ${savedEvent.event_name}`,
        //     message: `New event: ${savedEvent.event_name}`,
        //     school_id: savedEvent.school_id,
        //     grade_id: grade ? grade.id : null,
        //     grade_class_id: division ? division.id : null,
        //     created_by: savedEvent.created_by,
        //     module_id: module.id,
        // });

        return savedEvent;
    }

    async updateEvent(id: number, updateEventDto: Partial<UpdateEventDto>) {
        const event = await this.eventRepository.findOne({ where: { id } });
        if (!event) {
            throw new NotFoundException(`Event with ID ${id} not found`);
        }

        // Object.assign(event, updateEventDto);

        const updatedEvent = await this.eventRepository.save(updateEventDto);
        let module = await this.moduleServices.findModuleByNameShow("calendar");
        // await this.notificationService.createNotification({
        //     title: `Event updated: ${updatedEvent.event_name}`,
        //     message: `Updated event: ${updatedEvent.event_name}`,
        //     school_id: updatedEvent.school_id,
        //     grade_id: updatedEvent.grade_id,
        //     grade_class_id: updatedEvent.class_id,
        //     created_by: updatedEvent.created_by,
        //     module_id: module.id,
        // });

        return updatedEvent;
    }

    async deleteEvent(id: number) {
        const event = await this.eventRepository.findOne({ where: { id } });
        if (!event) {
            throw new NotFoundException(`Event with ID ${id} not found`);
        }

        event.deleted_at = new Date();
        await this.eventRepository.save(event);

        let module = await this.moduleServices.findModuleByNameShow("calendar");
        // await this.notificationService.createNotification({
        //     title: `Event deleted: ${event.event_name}`,
        //     message: `Deleted event: ${event.event_name}`,
        //     school_id: event.school_id,
        //     grade_id: event.grade_id,
        //     grade_class_id: event.class_id,
        //     created_by: event.created_by,
        //     module_id: module.id,
        // });

        return true;
    }

    async getEvents(reqQuery: any) {
        let queryObject = {
            type: Not("student"),
        };
        let timeTable;

        if (reqQuery?.school_id && reqQuery.school_id != "") {
            queryObject["school_id"] = reqQuery.school_id;

            timeTable = await this.timeTableRepository.find({
                where: { school_id: Number(reqQuery.school_id) },
                relations: ["grade", "division", "subject", "subject.master_subject"],
            });
        }

        let events = await this.eventRepository.find({
            where: queryObject,
            relations: ["grade", "division"],
        });

        timeTable = timeTable.map((data) => {
            data["event_name"] = `${data.assessment_name} (${data.subject.master_subject.subject_name}) ${data.grade.grade_number}`;
            data["type"] = "Exam";

            if (data?.division) {
                data["event_name"] += `${data.division.name}`;
            }

            delete data.grade;
            delete data.subject;
            delete data.division;

            return data;
        });

        let response = [...events, ...timeTable];
        return response;
    }

    async getEventsForAdmin(schoolId: number) {
        let events = await this.eventRepository.find({
            where: {
                school_id: schoolId,
                type: Not("student"),
            },
            relations: ["grade", "division"],
        });

        let timeTable = await this.timeTableRepository.find({
            where: { school_id: Number(schoolId) },
            relations: ["grade", "division", "subject", "subject.master_subject"],
        });

        timeTable = timeTable.map((data) => {
            data["event_name"] = `${data.assessment_name} (${data.subject.master_subject.subject_name}) ${data.grade.grade_number}`;
            data["type"] = "Exam";

            if (data?.division) {
                data["event_name"] += `${data.division.name}`;
            }

            delete data.grade;
            delete data.subject;
            delete data.division;

            return data;
        });

        let response = [...events, ...timeTable];

        return response;
    }

    async getDivisionNameById(divisionId: number): Promise<string | null> {
        const division = await this.divisionRepository.findOne({ where: { id: divisionId } });
        if (!division) {
            return null;
        }
        return division.name;
    }

    async getEventById(id: number): Promise<Event> {
        const event = await this.eventRepository.findOne({ where: { id: id } });

        if (!event) {
            throw new NotFoundException(`event with ID ${id} not found`);
        }
        return event;
    }

    async isExist(query: any): Promise<Event | null> {
        return await this.eventRepository.findOne({ where: query });
    }

    /*
     *   Create Multi event
     */

    // async createMultiEvent(createMultiEventDto: CreateMultiEventDto): Promise<Event[] | Event> {
    //     const {
    //         school_id,
    //         class_id,
    //         division_id,
    //         event_name,
    //         description,
    //         start_date,
    //         end_date,
    //         start_time,
    //         end_time,
    //         type,
    //     } = createMultiEventDto;

    //     console.log("🚀 ~ file: event.service.ts:184 ~ EventService ~ createMultiEvent ~ createMultiEventDto:", createMultiEventDto)

    //     let savedEvents: Event[] | Event;

    //     let created_by = createMultiEventDto["created_by"];
    //     let updated_by = createMultiEventDto["updated_by"]

    //     // Case 1: Only school_id provided
    //     if (!class_id && (!division_id || division_id.length === 0)) {
    //         const event = this.eventRepository.create({
    //             school_id,
    //             class_id: null,
    //             division_id: null,
    //             event_name,
    //             type,
    //             description,
    //             start_date,
    //             end_date,
    //             start_time,
    //             end_time,
    //             created_by,
    //             updated_by
    //         });
    //         savedEvents = await this.eventRepository.save(event);
    //     }

    //     // Case 2: Only school_id and class_id provided
    //     else if (class_id && (!division_id || division_id.length === 0)) {
    //         const event = this.eventRepository.create({
    //             school_id,
    //             class_id,
    //             division_id: null,
    //             event_name,
    //             type,
    //             description,
    //             start_date,
    //             end_date,
    //             start_time,
    //             end_time,
    //             created_by,
    //             updated_by
    //         });
    //         savedEvents = await this.eventRepository.save(event); ''
    //     }

    //     // Case 3: School_id, class_id, and division_id provided
    //     else if (division_id && division_id.length > 0) {
    //         const events = division_id.map((division) =>
    //             this.eventRepository.create({
    //                 school_id,
    //                 class_id,
    //                 division_id: parseInt(division),
    //                 event_name,
    //                 type,
    //                 description,
    //                 start_date,
    //                 end_date,
    //                 start_time,
    //                 end_time,
    //                 created_by,
    //                 updated_by
    //             }),
    //         );
    //         savedEvents = await this.eventRepository.save(events);
    //     } else {
    //         throw new Error('Invalid data provided');
    //     }

    //     let school = null;
    //     let grade = null;
    //     let division = null;

    //     if (school_id) {
    //         school = await this.instituteRepository.findOne({
    //             where: { id: school_id },
    //         });

    //         if (!school) {
    //             throw new Error("Institute not found for the provided school_id.");
    //         }
    //     }

    //     if (class_id) {
    //         grade = await this.gradeRepository.findOne({
    //             where: { id: class_id },
    //         });

    //         if (!grade) {
    //             throw new Error("Grade not found for the provided class_id.");
    //         }
    //     }

    //     if (school) {
    //         this.socketGateway.emitSchoolEventUpdate(school.id, savedEvents);
    //     }

    //     if (grade) {
    //         this.socketGateway.emitClassEventUpdate(grade.id, savedEvents);
    //     }
    //     if (division) {
    //         this.socketGateway.emitDivisionEventUpdate(division.id, savedEvents);
    //     }

    //     return savedEvents;
    // }
    async eventDetail(id: number): Promise<Event> {
        const event = await this.eventRepository.findOne({ where: { id: id } });

        return event;
    }
    async eventDetailWithPop(id: number): Promise<Event> {
        const event = await this.eventRepository.findOne({
            where: { id: id },
            relations: ["grade", "division", "institute"], // Load related entities
        });
        return event;
    }
    async createSingleEvent(body: Partial<Event>) {
        const event = this.eventRepository.create(body);
        return await this.eventRepository.save(event);
    }

    async createMultiple(payload: Event[]) {
        return await this.eventRepository.insert(payload);
    }

    async findDivision(query: any) {
        return await this.divisionRepository.find(query);
    }

    async findDivisionById(id: number) {
        return await this.divisionRepository.findOne({ where: { id: id } });
    }

    async findStudent(id: number): Promise<Student> {
        return await this.studentRepository.findOne({ where: { id: id } });
    }

    async fetchEventsForTeacher(id: number, school_id: number): Promise<Partial<Event>[]> {
        let data = await this.divisionSubjectRepository.find({
            where: { teacher_id: id },
            select: ["grade_id", "grade_class_id", "school_id", "id"],
            relations: ["grade", "division"],
        });

        const gradeSet = new Set<string | number>();
        const gradeClassSet = new Set<string | number>();

        if (!data?.length) {
            return [];
        }

        data.forEach((item: DivisionSubject) => {
            if (item.grade_id !== undefined) gradeSet.add(item.grade_id);
            if (item.grade_class_id !== undefined) gradeClassSet.add(item.grade_class_id);
        });

        const gradeArray = Array.from(gradeSet);
        const gradeClassArray = Array.from(gradeClassSet);

        let events = await this.eventRepository.find({
            where: [
                {
                    type: "school",
                    school_id: Number(school_id),
                },
                {
                    grade_id: In(gradeArray),
                    school_id: Number(school_id),
                },
            ],
            relations: ["grade", "division"],
        });

        let timeTable = await this.timeTableRepository.find({
            where: { grade_id: In(gradeArray), school_id: Number(school_id) },
            relations: ["grade", "division", "subject", "subject.master_subject"],
        });

        if (!events?.length) {
            return [];
        }

        events = events.filter((data) => data.type === "school" || gradeClassArray.includes(data.class_id) || data?.class_id === null);

        let filteredTimeTable = timeTable.filter((data) => {
            return data?.class_id === null || gradeClassArray.includes(data.class_id);
        });

        filteredTimeTable = filteredTimeTable.map((data) => {
            data["event_name"] = `${data.assessment_name} (${data.subject.master_subject.subject_name}) ${data.grade.grade_number}`;
            data["type"] = "Exam";
            if (data?.division) {
                data["event_name"] += `${data.division.name}`;
            }

            delete data.grade;
            delete data.subject;
            delete data.division;

            return data;
        });

        let response = [...events, ...filteredTimeTable];

        return response;
    }

    // fetchTeacher
    async fetchTeacher(id: number): Promise<Teacher> {
        return await this.teacherRepository.findOne({ where: { teacher_user_id: id } });
    }

    // fetchStudent
    async fetchStudent(id: number): Promise<Student> {
        return await this.studentRepository.findOne({ where: { student_user_id: id } });
    }

    async fetchStudentEvent(student: Student, school_id: number): Promise<Partial<Event>[]> {
        const events = await this.eventRepository.find({
            where: [
                {
                    type: "school",
                    school_id: Number(school_id),
                },
                {
                    school_id: Number(school_id),
                    grade_id: Number(student.grade_id),
                    class_id: Number(student.grade_class_id),
                },
                {
                    school_id: Number(school_id),
                    created_by: Number(student.id),
                    type: "student",
                },
                {
                    type: "grade",
                    school_id: Number(school_id),
                    grade_id: Number(student.grade_id),
                },
            ],
            relations: ["grade", "division"],
        });

        const timeTable = await this.timeTableRepository.find({
            where: {
                grade_id: student.grade_id,
                school_id: Number(school_id),
            },
            relations: ["grade", "division", "subject", "subject.master_subject"],
        });

        let filteredTimeTable = timeTable.filter((data) => {
            return data?.class_id === null || String(data.class_id) == String(student.grade_class_id);
        });

        filteredTimeTable = filteredTimeTable.map((data) => {
            data["event_name"] = `${data.assessment_name} (${data.subject.master_subject.subject_name}) ${data.grade.grade_number}`;
            data["type"] = "Exam";

            if (data?.division) {
                data["event_name"] += `${data.division}`;
            }

            delete data.grade;
            delete data.subject;
            delete data.division;

            return data;
        });
        let response = [...events, ...filteredTimeTable];

        return response;
    }
    async findGrade(query: any) {
        console.log(query);
        return await this.gradeRepository.find(query);
    }

    async findGradeById(gradeId: number) {
        return await this.gradeRepository.findOne({ where: { id: gradeId } });
    }

    async getEventByQuery(query: any) {
        return await this.eventRepository.find({ where: query });
    }

    async bulkUpdate(data: Partial<Event>[]) {
        return await this.eventRepository.save(data);
    }
}
