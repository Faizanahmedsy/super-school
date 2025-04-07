import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsString, IsEmail, IsNotEmpty, IsOptional, isNumber, IsNumber, MinLength, Matches, isInt, IsInt } from "class-validator";

export class CreateAdminDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    first_name: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    last_name: string;

    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    @IsEmail({}, { message: "Email format is invalid" })
    email: string;

    @ApiProperty()
    @IsOptional()
    @Matches(/^[+\d][\d]{9,14}$/, {
        message: "Mobile number must be between 10 to 15 digits with an optional country code",
    })
    mobile_number: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    gender: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    date_of_birth: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    profile_image?: string;

    @ApiProperty()
    @IsOptional()
    @IsInt()
    @Transform(({ value }) => Number(value))
    school_id: number;
}
