import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsString, IsEmail, IsOptional, IsNumber, MinLength, IsArray, ArrayNotEmpty, IsInt, Matches } from "class-validator";
import { optional } from "joi";

export class UpdateTeacherDto {
    @ApiProperty()
    @IsString()
    @IsOptional()
    first_name?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    last_name?: string;

    @ApiProperty()
    @IsEmail({}, { message: "Email format is invalid" })
    @IsOptional()
    email?: string;

    @ApiProperty()
    @IsOptional()
    @Matches(/^[+\d][\d]{9,14}$/, {
        message: "Mobile number must be between 10 to 15 digits with an optional country code",
    })
    mobile_number?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    gender?: string;

    // @ApiProperty()
    // @IsString()
    // @IsOptional()
    // subject_specialization?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    date_of_birth?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    hire_date?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    profile_image?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    extra_activity?: string;

    @ApiProperty()
    @IsOptional()
    @IsInt()
    @Transform(({ value }) => Number(value))
    school_id?: number;

    @ApiProperty()
    @IsString()
    @IsOptional()
    sace_number: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    persal_number: string;
}
