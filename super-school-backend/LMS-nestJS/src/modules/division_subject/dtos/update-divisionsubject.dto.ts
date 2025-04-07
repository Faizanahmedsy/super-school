import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsNumber, IsArray } from "class-validator";

export class UpdateDivisionSubjectDto {
    @ApiProperty()
    @IsOptional()
    @IsNumber()
    grade_id?: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    grade_class_id?: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    subject_id?: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    teacher_id?: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    school_id?: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    term_id?: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    batch_id?: number;
}
