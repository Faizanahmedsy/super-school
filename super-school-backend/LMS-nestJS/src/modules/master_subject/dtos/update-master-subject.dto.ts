import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsDate, IsBoolean, IsNumber } from "class-validator";

export class UpdateMasterSubjectDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
    grade_number?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    subject_code?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    subject_name?: string;

    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    is_language?: boolean;
}
