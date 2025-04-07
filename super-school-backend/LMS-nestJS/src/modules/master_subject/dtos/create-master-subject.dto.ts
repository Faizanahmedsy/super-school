import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsDate, IsBoolean, IsNumber } from "class-validator";

export class CreateMasterSubjectDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    grade_number: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    subject_code: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    subject_name: string;

    @ApiProperty()
    @IsBoolean()
    @IsNotEmpty()
    is_language: boolean;
}
