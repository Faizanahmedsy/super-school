import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
    IsString,
    IsEmail,
    IsNotEmpty,
    IsOptional,
    isNumber,
    IsNumber,
    MinLength,
    IsInt,
    IsArray,
    ArrayNotEmpty,
    ValidateNested,
    IsBoolean,
} from "class-validator";

export class SubjectDto {
    @ApiProperty()
    @IsNumber()
    grade_id: number;

    @ApiProperty()
    @IsNumber()
    grade_class_id: number;

    @ApiProperty()
    @IsNumber()
    subject_id: number;

    @ApiProperty()
    @IsNumber()
    batch_id: number;
}

export class MultiCreateSubjectTeacherDto {
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    school_id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    teacher_id: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    batch_id: number;

    @ApiProperty({
        type: [SubjectDto], // Documenting that this is an array of SubjectDto
        description: "List of Subjects",
        example: [
            {
                grade_id: 1,
                grade_class_id: 1,
                subject_id: 1,
                batch_id: 1,
            },
        ],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SubjectDto)
    subjects: SubjectDto[];
}
