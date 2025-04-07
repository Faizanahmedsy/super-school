import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsObject, ValidateNested, IsNumber, IsArray, IsString, Min, Max } from "class-validator";
import { Type } from "class-transformer";
import { SetupStep } from "helper/constants";

@ApiExtraModels()
export class YearDataDto {
    @ApiProperty({
        example: 2024,
        description: "Academic year",
        minimum: 2000,
        maximum: 2100,
    })
    @IsNumber()
    @Min(2000)
    @Max(2100)
    year: number;

    @ApiProperty({
        example: 1,
        description: "Batch Id",
    })
    @IsNumber() // Add this validation decorator
    @Min(1) // Add this to ensure batch_id is a positive number
    batch_id: number;
}

@ApiExtraModels()
export class GradeDataDto {
    @ApiProperty({
        example: 1,
        description: "Grade number",
        minimum: 1,
    })
    @IsNumber()
    @Min(1)
    grade_number: number;

    @ApiProperty({
        example: 80,
        description: "Grade ID",
        minimum: 1,
    })
    @IsNumber()
    @Min(1)
    id: number;
}

@ApiExtraModels()
export class ClassDataDto {
    @ApiProperty({
        example: "A",
        description: "Class identifier",
    })
    @IsString()
    class: string;
}

@ApiExtraModels()
export class GradeWithClassesDto {
    @ApiProperty({
        example: 1,
        description: "Grade number",
        minimum: 1,
    })
    @IsNumber()
    @Min(1)
    grade_number: number;

    @ApiProperty({
        example: 2,
        description: "Number of classes in this grade",
        minimum: 1,
    })
    @IsNumber()
    @Min(1)
    number_of_classes: number;

    @ApiProperty({
        type: [ClassDataDto],
        description: "List of classes in this grade",
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ClassDataDto)
    classes: ClassDataDto[];
}

@ApiExtraModels()
export class GradesArrayDto {
    @ApiProperty({ type: [GradeDataDto], description: "List of grades" })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => GradeDataDto)
    grades: GradeDataDto[];
}

@ApiExtraModels()
export class GradesWithClassesArrayDto {
    @ApiProperty({ type: [GradeWithClassesDto], description: "List of grades with classes" })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => GradeWithClassesDto)
    grades: GradeWithClassesDto[];
}

@ApiExtraModels()
export class SubjectAssignmentDto {
    @ApiProperty({
        example: 1,
        description: "Master subject ID",
        minimum: 1,
    })
    @IsNumber()
    @Min(1)
    master_subject_id: number;

    @ApiProperty({
        example: 14,
        description: "School ID",
        minimum: 1,
    })
    @IsNumber()
    @Min(1)
    school_id: number;

    @ApiProperty({
        example: 58,
        description: "Grade ID",
        minimum: 1,
    })
    @IsNumber()
    @Min(1)
    grade_id: number;

    @ApiProperty({
        example: 12,
        description: "Batch ID",
        minimum: 1,
    })
    @IsNumber()
    @Min(1)
    batch_id: number;
}

@ApiExtraModels()
export class SubjectAssignmentArrayDto {
    @ApiProperty({
        type: [SubjectAssignmentDto],
        description: "List of subject assignments",
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SubjectAssignmentDto)
    subjects: SubjectAssignmentDto[];
}

// Update the existing interfaces

@ApiExtraModels(
    YearDataDto,
    GradeDataDto,
    ClassDataDto,
    GradeWithClassesDto,
    GradesArrayDto,
    GradesWithClassesArrayDto,
    SubjectAssignmentDto,
    SubjectAssignmentArrayDto
)
export class UpdateSetupDto {
    @ApiProperty({
        enum: SetupStep,
        example: SetupStep.CREATE_YEAR,
        description: "Current setup step",
    })
    @IsEnum(SetupStep)
    step: string;

    @ApiProperty({
        example: 1,
        description: "Batch Id",
    })
    batch_id: number;

    @ApiProperty({
        description: "Step specific data",
        type: "object",
        examples: {
            create_year: {
                value: {
                    year: 2024,
                },
                batch_id: 1,
            },
            create_grades: {
                value: {
                    grades: [{ grade_number: 1 }],
                },
            },
            create_classes: {
                value: {
                    grades: [
                        {
                            grade_number: 1,
                            number_of_classes: 2,
                            classes: [{ class: "A" }, { class: "B" }],
                        },
                    ],
                },
            },
            assign_subjects: {
                value: {
                    subjects: [
                        {
                            master_subject_id: 1,
                            school_id: 14,
                            grade_id: 58,
                            batch_id: 12,
                        },
                    ],
                },
            },
        },
    })
    @IsNotEmpty()
    @IsObject()
    @ValidateNested()
    @Type((opts) => {
        return (
            {
                [SetupStep.CREATE_YEAR]: YearDataDto,
                [SetupStep.CREATE_GRADES]: GradesArrayDto,
                [SetupStep.CREATE_CLASSES]: GradesWithClassesArrayDto,
                [SetupStep.ASSIGN_SUBJECTS]: SubjectAssignmentArrayDto,
            }[opts.object.step] || YearDataDto
        );
    })
    data: YearDataDto | GradesArrayDto | GradesWithClassesArrayDto | SubjectAssignmentArrayDto;
}
