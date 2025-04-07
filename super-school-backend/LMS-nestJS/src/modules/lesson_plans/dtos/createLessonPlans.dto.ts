import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateLessonPlanDto {
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    school_id: number;

    // @ApiProperty()
    // @IsNotEmpty()
    // @IsNumber()
    // teacher_id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    grade_id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    grade_class_id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    subject_id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    activity: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    term_id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    batch_id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    date: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    start_time: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    end_time: string;

    // @IsNotEmpty()
    // @IsNumber()
    // teacher_id: number;
}
