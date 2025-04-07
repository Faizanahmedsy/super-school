import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsString, IsNotEmpty, IsOptional, IsInt } from "class-validator";

export class CreateAssessmentDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    assessment_name: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    assessment_start_datetime: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    assessment_end_datetime: string;

    @ApiProperty()
    @IsOptional()
    @IsInt()
    @Transform(({ value }) => Number(value))
    institute_id: number;

    @ApiProperty()
    @IsOptional()
    @IsInt()
    @Transform(({ value }) => Number(value))
    grade_id: number;

    @ApiProperty()
    @IsOptional()
    @IsInt()
    @Transform(({ value }) => Number(value))
    gradeClass_id: number;

    @ApiProperty()
    @IsOptional()
    @IsString()
    status: string;

    @ApiProperty()
    @IsOptional()
    @IsInt()
    @Transform(({ value }) => Number(value))
    batch_id: number;

    @ApiProperty()
    @IsOptional()
    @IsInt()
    @Transform(({ value }) => Number(value))
    term_id: number;
}
