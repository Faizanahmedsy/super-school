import { IsString, IsInt, IsOptional, IsArray, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";

export class UpdateDigitalMarkingDto {
    @ApiProperty()
    @IsOptional()
    @IsInt()
    @Transform(({ value }) => Number(value))
    student_answer_sheet_id: number;

    @ApiProperty()
    @IsOptional()
    @IsInt()
    @Transform(({ value }) => Number(value))
    school_id: number;

    @ApiProperty()
    @IsString()
    @IsOptional()
    question_number: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    question: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    answer: string;

    @ApiProperty({ type: [String] })
    @IsArray()
    @IsOptional()
    not_detected_word: string[];

    @ApiProperty()
    @IsOptional()
    @IsInt()
    @Transform(({ value }) => Number(value))
    confidence_score: number;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    actual_mark: number;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    obtained_mark: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    obtained_manual_mark?: number | null;

    @ApiProperty()
    @IsString()
    @IsOptional()
    reason: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    teacher_reason?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    strength: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    weakness: string;

    @ApiProperty()
    @IsOptional()
    @IsInt()
    @Transform(({ value }) => Number(value))
    batch_id: number;

    @ApiProperty()
    @IsOptional()
    @IsInt()
    @Transform(({ value }) => Number(value))
    term_id: number;
}
