import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsEmail, IsOptional, IsNumber, MinLength, IsNotEmpty } from "class-validator";
import { optional } from "joi";

export class UpdateGradeDto {
    @ApiProperty()
    @IsOptional()
    @IsNumber()
    grade_number?: number;

    @ApiProperty()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    batch_id?: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    school_id?: number;
}
