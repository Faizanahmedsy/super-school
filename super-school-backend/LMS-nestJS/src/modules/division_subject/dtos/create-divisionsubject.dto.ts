import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, ValidateNested } from "class-validator";

export class CreateDivisionSubjectDto {
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    school_id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    teacher_id: number;

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
    @IsNumber()
    term_id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    batch_id: number;
}
