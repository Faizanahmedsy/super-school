import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";

export class LearnerTeacherListDto {
    @ApiProperty()
    @IsOptional()
    page: string;

    @ApiProperty()
    @IsOptional()
    limit: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @Transform(({ value }) => Number(value))
    school_id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @Transform(({ value }) => Number(value))
    batch_id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @Transform(({ value }) => Number(value))
    subject_id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @Transform(({ value }) => Number(value))
    grade_class_id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @Transform(({ value }) => Number(value))
    grade_id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @Transform(({ value }) => Number(value))
    master_subject_id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    type: string;
}
