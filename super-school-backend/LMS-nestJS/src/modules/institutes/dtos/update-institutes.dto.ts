import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsInt, IsDecimal, IsNumber, IsNotEmpty, Matches, IsEmail, IsEmpty } from "class-validator";

export class UpdateInstituteDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
    school_name?: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    district_id?: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    province_id?: number;

    @ApiProperty()
    @IsOptional()
    @IsString()
    school_type?: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    max_users?: number;

    @ApiProperty()
    @IsOptional()
    @IsString()
    medium_of_instruction?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    EMIS_number?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    address?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    location_type?: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @Matches(/^[+\d][\d]{9,14}$/, {
        message: "Mobile number must be between 10 to 15 digits with an optional country code",
    })
    contact_number?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    contact_person?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    @IsEmail({}, { message: "Email format is invalid" })
    contact_email?: string;
}
