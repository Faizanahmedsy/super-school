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
    @IsString()
    grade_number: string;

    @ApiProperty()
    @IsString()
    subject_code: string;

    @ApiProperty()
    @IsString()
    subject_name: string;

    @ApiProperty()
    @IsBoolean()
    is_language: boolean;
}

export class MultiCreateSubjectDto {
    @ApiProperty({
        type: [SubjectDto], // Documenting that this is an array of SubjectDto
        description: "List of Subjects",
        example: [
            {
                grade_number: "1",
                subject_code: "123",
                subject_name: "Maths",
                is_language: true,
            },
        ],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SubjectDto)
    subjects: SubjectDto[];
}
