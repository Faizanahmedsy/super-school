import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsString, IsEmail, IsOptional, IsNumber, MinLength, Matches, IsInt } from "class-validator";
import { optional } from "joi";

export class UpdateAdminDto {
    @ApiProperty()
    @IsString()
    @IsOptional()
    first_name?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    last_name?: string;

    @ApiProperty()
    @IsOptional()
    @IsEmail({}, { message: "Email format is invalid" })
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

    @ApiProperty()
    @IsOptional()
    @IsString()
    date_of_birth?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    profile_image?: string;

    @ApiProperty()
    @IsOptional()
    @IsInt()
    @Transform(({ value }) => Number(value))
    role_id?: number;

    @ApiProperty()
    @IsOptional()
    @IsInt()
    @Transform(({ value }) => Number(value))
    school_id?: number;
}
