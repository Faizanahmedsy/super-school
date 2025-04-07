import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, ValidateNested } from "class-validator";

export class UnassignSubject {
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
    batch_id: number;

    @ApiProperty()
    @IsOptional()
    // @IsNotEmpty()
    @IsNumber()
    assign_to_teacher_id: number;
}
