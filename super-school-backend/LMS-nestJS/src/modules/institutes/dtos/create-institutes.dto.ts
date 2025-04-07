import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength, IsDecimal, IsNumber, Matches, IsEmail, IsEmpty, IsOptional } from "class-validator";

export class CreateInstituteDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    school_name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    district_id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    province_id: number;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    school_type: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    max_users: number;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    medium_of_instruction: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    EMIS_number: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    address: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    location_type: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    @Matches(/^[+\d][\d]{9,14}$/, {
        message: "Mobile number must be between 10 to 15 digits with an optional country code",
    })
    contact_number: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    contact_person: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @IsEmail({}, { message: "Email format is invalid" })
    contact_email: string;
}
