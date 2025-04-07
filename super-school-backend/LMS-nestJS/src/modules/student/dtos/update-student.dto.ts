import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsString, IsEmail, IsOptional, IsNumber, MinLength, IsNotEmpty, Matches, IsInt } from "class-validator";
import { optional } from "joi";

export class UpdateStudentDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    addmission_no?: string;

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

    @ApiProperty()
    @IsOptional()
    @IsString()
    date_of_birth?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    profile_image?: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @Transform(({ value }) => Number(value))
    school_id?: number;

    @ApiProperty()
    // @IsNotEmpty()
    @IsOptional()
    @IsInt()
    @Transform(({ value }) => Number(value))
    cur_batch_id?: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @Transform(({ value }) => Number(value))
    grade_id?: number;

    @ApiProperty({ description: "Subject ids", example: "1,2,3" })
    @IsNotEmpty()
    @IsString()
    subject_ids_string: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @Transform(({ value }) => Number(value))
    grade_class_id?: number;

    @ApiProperty({ description: "Extra Activity", example: "ale" })
    @IsOptional()
    @IsString()
    extra_activity?: string;

    @ApiProperty({ description: "parent ids", example: "1,2,3" })
    @IsNotEmpty()
    @IsString()
    parent_ids_string: string;

    @ApiProperty({ type: "file", required: false })
    readonly file?: any;
}
