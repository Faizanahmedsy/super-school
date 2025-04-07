import { IsString, IsNotEmpty, IsDateString, IsOptional, IsEnum, IsArray, IsInt } from "class-validator";
import { Transform, Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateAssessmentSubjectDto {
    @ApiProperty()
    @IsOptional()
    @IsInt()
    @Transform(({ value }) => Number(value))
    assessment_id?: number;

    @ApiProperty()
    @IsOptional()
    @IsInt()
    @Transform(({ value }) => Number(value))
    subject_id?: number;

    @ApiProperty()
    @IsOptional()
    @IsInt()
    @Transform(({ value }) => Number(value))
    grade_id?: number;

    @ApiProperty()
    @IsOptional()
    @IsInt()
    @Transform(({ value }) => Number(value))
    grade_class_id?: number;

    @ApiProperty()
    @IsOptional()
    @IsInt()
    @Transform(({ value }) => Number(value))
    school_id?: number;

    @ApiProperty()
    @IsArray()
    @IsInt({ each: true })
    @IsOptional()
    student_ids?: number[];

    @ApiProperty()
    @IsOptional()
    @IsString()
    memorandom?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    question_paper?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    assessment_start_datetime?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    assessment_end_datetime?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    paper_title?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    status?: string;

    @ApiProperty()
    @IsOptional()
    @IsInt()
    @Transform(({ value }) => Number(value))
    batch_id?: number;

    @ApiProperty()
    @IsOptional()
    @IsInt()
    @Transform(({ value }) => Number(value))
    term_id?: number;
}
