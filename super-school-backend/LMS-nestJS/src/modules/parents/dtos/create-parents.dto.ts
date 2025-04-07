import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsString, IsEmail, IsNotEmpty, IsOptional, isNumber, IsNumber, MinLength, Matches, IsInt } from "class-validator";

export class CreateParentDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
    first_name: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    last_name: string;

    @ApiProperty()
    @IsOptional()
    @IsEmail({}, { message: "Email format is invalid" })
    email: string;

    @ApiProperty()
    @IsOptional()
    @Matches(/^[+\d][\d]{9,14}$/, {
        message: "Mobile number must be between 10 to 15 digits with an optional country code",
    })
    mobile_number: string;

    // @ApiProperty()
    // @IsNotEmpty()
    // @IsString()
    // gender: string;

    // @ApiProperty()
    // @IsOptional()
    // @IsString()
    // date_of_birth: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    relation?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    profile_image?: string;

    @ApiProperty()
    @IsOptional()
    @Transform(({ value }) => Number(value))
    school_id: number;

    // @ApiProperty()
    // @IsNotEmpty()
    // @IsInt()
    // @Transform(({ value }) => Number(value))
    // no_of_student: number;

    // @ApiProperty({ description: "Student ids", example: "1,2,3" })
    // @IsNotEmpty()
    // @IsString()
    // student_ids_string: string;
}
