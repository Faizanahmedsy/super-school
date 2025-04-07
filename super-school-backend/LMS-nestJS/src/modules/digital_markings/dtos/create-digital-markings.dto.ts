import { IsString, IsInt, IsOptional, IsArray, IsNumber, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";

export class CreateDigitalMarkingDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @Transform(({ value }) => Number(value))
    student_answer_sheet_id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @Transform(({ value }) => Number(value))
    school_id: number;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    question_number: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    question: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    answer: string;

    @ApiProperty({ type: [String] })
    @IsArray()
    @IsNotEmpty()
    not_detected_word: string[];

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @Transform(({ value }) => Number(value))
    confidence_score: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    actual_mark: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    obtained_mark: number;

    @ApiProperty({ required: false })
    @IsNotEmpty()
    @IsNumber()
    obtained_manual_mark?: number | null;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    reason: string;

    @ApiProperty({ required: false })
    @IsNotEmpty()
    @IsString()
    teacher_reason?: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    strength: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    weakness: string;

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
}
