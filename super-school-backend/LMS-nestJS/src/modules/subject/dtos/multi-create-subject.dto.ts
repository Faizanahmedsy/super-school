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
    master_subject_id: number;

    @ApiProperty()
    @IsNumber()
    school_id: number;

    @ApiProperty()
    @IsNumber()
    grade_id: number;

    // @ApiProperty()
    // @IsNumber()
    // term_id: number;

    @ApiProperty()
    @IsNumber()
    batch_id: number;
}

export class MultiCreateSubjectsDto {
    @ApiProperty({
        type: [SubjectDto], // Documenting that this is an array of SubjectDto
        description: "List of Subjects",
        example: [
            {
                master_subject_id: 1,
                school_id: 1,
                grade_id: 1,
                // term_id: 1,
                batch_id: 1,
            },
        ],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SubjectDto)
    subjects: SubjectDto[];
}
