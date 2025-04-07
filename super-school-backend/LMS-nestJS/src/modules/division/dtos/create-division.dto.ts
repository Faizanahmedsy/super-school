import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsEmail, IsNotEmpty, IsOptional, isNumber, IsNumber, MinLength } from "class-validator";

export class GradeDto {
    @ApiProperty({ example: 8 })
    @IsNotEmpty()
    @IsNumber()
    grade_number: number;

    @ApiProperty({ example: "description" })
    @IsNotEmpty()
    @IsString()
    description: string;
}

export class CreateDivisionDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    grade_id: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    school_id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    batch_id: number;
}
