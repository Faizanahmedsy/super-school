import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsString, IsEmail, IsOptional,Matches, IsInt } from "class-validator";

export class UpdateDepartmentUserDto {
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
    @IsOptional()
    @IsString()
    profile_image?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    job_title?: string;

    @ApiProperty()
    @IsOptional()
    @IsInt()
    @Transform(({ value }) => Number(value))
    district_id?: number;

    @ApiProperty()
    @IsOptional()
    @IsInt()
    @Transform(({ value }) => Number(value))
    province_id?: number;
}
