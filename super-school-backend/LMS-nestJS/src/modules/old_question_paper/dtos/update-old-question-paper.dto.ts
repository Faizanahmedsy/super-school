import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsOptional, IsNumber, IsString } from "class-validator";

export class UpdateOldQuestionPaperDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
    paper_name?: string;

    @ApiProperty()
    @IsOptional()
    paper_exam_date?: string;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => parseInt(value, 10))
    subject_id?: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => parseInt(value, 10))
    grade_id?: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => parseInt(value, 10))
    batch_id?: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => parseInt(value, 10))
    school_id?: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => parseInt(value, 10))
    term_id?: number;

    @ApiProperty()
    @IsOptional()
    @Transform(({ value }) => parseInt(value, 10))
    updated_by?: number;

    @ApiProperty({ type: "file", required: false })
    readonly file: any;

    @IsOptional()
    @IsString()
    pdfPath?: string;

    @IsOptional()
    @IsString()
    paper_path: string;
}
