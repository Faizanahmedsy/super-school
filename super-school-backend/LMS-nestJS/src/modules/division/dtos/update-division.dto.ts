import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsEmail, IsOptional, IsNumber, MinLength, IsNotEmpty } from "class-validator";
import { optional } from "joi";

export class UpdateDivisionDto {
    @ApiProperty()
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    grade_id?: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    school_id?: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    batch_id?: number;
}
