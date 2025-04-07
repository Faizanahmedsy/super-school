import { IsOptional, IsString, IsNumberString, IsInt } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class GetSubjectsQueryDto {
    @ApiPropertyOptional({ description: "Sort order (asc/desc)", example: "asc" })
    @IsOptional()
    @IsString()
    sort?: string;

    @ApiPropertyOptional({ description: "Limit the number of results", example: 10 })
    @IsOptional()
    @IsNumberString()
    limit?: string;

    @ApiPropertyOptional({ description: "Page number for pagination", example: 1 })
    @IsOptional()
    @IsNumberString()
    page?: string;

    @IsOptional()
    @IsOptional()
    @IsNumberString()
    school_id?: string;

    @IsOptional()
    @IsOptional()
    @IsNumberString()
    grade_id?: string;

    @IsOptional()
    @IsOptional()
    @IsNumberString()
    term_id?: string;

    @IsOptional()
    @IsOptional()
    @IsNumberString()
    batch_id?: string;

    @IsOptional()
    @IsOptional()
    @IsNumberString()
    master_subject_id?: string;

    @ApiPropertyOptional({ description: "getting student count", example: true })
    @IsOptional()
    student_count?: boolean;

    @ApiPropertyOptional({ name: "checkStudent", required: false, type: Boolean, example: true, description: "Student count based filter" })
    @IsOptional()
    checkStudent?: boolean;
}
