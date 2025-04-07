import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateLessonPlanDto {
    @ApiProperty()
    @IsNumber()
    @IsOptional()
    school_id: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    grade_id: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    grade_class_id: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    subject_id: number;

    @ApiProperty()
    @IsOptional()
    @IsString()
    title: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    activity: string;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    term_id: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    batch_id: number;

    @ApiProperty()
    @IsOptional()
    @IsString()
    date: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    start_time: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    end_time: string;
}
