import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsEmail, IsNotEmpty, IsOptional, isNumber, IsNumber, MinLength, MaxLength } from "class-validator";

export class CreateGradeDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    grade_number: number;

    @ApiProperty()
    @IsString()
    @IsOptional()
    @MaxLength(255)
    description: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    batch_id: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    school_id: number;
}
