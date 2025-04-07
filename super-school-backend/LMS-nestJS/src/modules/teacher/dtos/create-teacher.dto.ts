import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsString, IsEmail, IsNotEmpty, IsOptional, isNumber, IsNumber, MinLength, IsArray, ArrayNotEmpty, IsInt, Matches, MaxLength } from "class-validator";

export class CreateTeacherDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    first_name: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    last_name: string;

    @ApiProperty()
    @IsEmail({}, { message: "Email format is invalid" })
    @IsNotEmpty()
    email: string;

    @ApiProperty()
    @IsOptional()
    @Matches(/^[+\d][\d]{9,14}$/, {
        message: "Mobile number must be between 10 to 15 digits with an optional country code",
    })
    mobile_number: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    gender: string;

    // @ApiProperty()
    // @IsString()
    // @IsOptional()
    // subject_specialization: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    date_of_birth: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsOptional()
    hire_date: string;

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
    school_id: number;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    sace_number: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    persal_number: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @Transform(({ value }) => Number(value))
    cur_batch_id: number;

    @ApiProperty({ type: "file", required: false })
    readonly file: any;
}
