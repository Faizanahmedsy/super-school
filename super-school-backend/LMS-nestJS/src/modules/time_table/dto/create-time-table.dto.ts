import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsString, IsNotEmpty, IsOptional, IsInt } from "class-validator";

export class CreateTimeTable {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    assessment_name: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    paper_title: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    start_date: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    end_date: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    start_time: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    end_time: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @Transform(({ value }) => Number(value))
    school_id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @Transform(({ value }) => Number(value))
    grade_id: number;

    @ApiProperty()
    @IsOptional()
    @IsInt()
    @Transform(({ value }) => Number(value))
    class_id: number;

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
    subject_id: number;
}
