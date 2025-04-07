import { IsNotEmpty, IsOptional, IsBoolean, IsString, IsInt } from "class-validator";
import { Transform, Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class CreateStudentAnswerSheetDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @Transform(({ value }) => Number(value))
    student_id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @Transform(({ value }) => Number(value))
    assessment_subject_id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @Transform(({ value }) => Number(value))
    school_id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    answer_sheet: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @Transform(({ value }) => Number(value))
    batch_id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @Transform(({ value }) => Number(value))
    term_id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @Transform(({ value }) => Number(value))
    grade_id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @Transform(({ value }) => Number(value))
    grade_class_id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    feedback?: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsBoolean()
    ocr_status?: boolean;
}
