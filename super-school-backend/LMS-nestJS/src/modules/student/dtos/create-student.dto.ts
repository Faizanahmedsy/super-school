import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsEmail, IsNotEmpty, IsOptional, IsInt, IsDateString, Matches, IsArray, ArrayNotEmpty, ArrayMinSize, ValidateNested } from "class-validator";
import { Transform, Type } from "class-transformer";
import { CreateParentDto } from "src/modules/parents/dtos/create-parents.dto";
class Subject {
    @ApiProperty({ description: "Subject ID", example: 1 })
    @IsInt()
    id: number;
}
export class CreateStudentDto {
    @ApiProperty({ description: "Admission number of the student", example: 12345 })
    @IsNotEmpty()
    @IsString()
    addmission_no: string;

    @ApiProperty({ description: "First name of the student", example: "John" })
    @IsString()
    @IsNotEmpty()
    first_name: string;

    @ApiProperty({ description: "Last name of the student", example: "Doe" })
    @IsString()
    @IsNotEmpty()
    last_name: string;

    @ApiProperty({ description: "Email of the student", example: "john.doe@example.com" })
    @IsEmail({}, { message: "Email format is invalid" })
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        description: "Mobile number with country code",
        example: "+1234567890",
        pattern: "^[+\\d][\\d]{9,14}$",
    })
    @IsOptional()
    @Matches(/^[+\d][\d]{9,14}$/, { message: "Mobile number must be 10 to 15 digits with an optional country code" })
    mobile_number: string;

    @ApiProperty({ description: "Gender of the student", example: "male" })
    @IsOptional()
    @IsString()
    gender?: string;

    @ApiProperty({ description: "Extra Activity", example: "ale" })
    @IsOptional()
    @IsString()
    extra_activity?: string;

    @ApiProperty({ description: "Date of birth in YYYY-MM-DD format", example: "2005-08-15" })
    @IsOptional()
    @IsDateString({}, { message: "Date of birth must be a valid date" })
    date_of_birth?: string;

    @ApiProperty({ description: "Profile photo path if available" })
    @IsOptional()
    @IsString()
    profile_image?: string;

    @ApiProperty({ description: "School ID associated with the student", example: 1 })
    @IsOptional()
    @IsInt()
    @Transform(({ value }) => Number(value))
    school_id: number;

    @ApiProperty({ description: "Batch ID for the current batch", example: 3 })
    @IsNotEmpty()
    @IsInt()
    @Transform(({ value }) => Number(value))
    cur_batch_id: number;

    @ApiProperty({ description: "Grade id", example: 4 })
    @IsNotEmpty()
    @IsInt()
    @Transform(({ value }) => Number(value))
    grade_id?: number;

    // @ApiProperty()
    // @IsNotEmpty()
    // @IsInt()
    // @Transform(({ value }) => Number(value))
    // role_id?: number;

    @ApiProperty({ description: "Grade class ID", example: 4 })
    @IsNotEmpty()
    @IsInt()
    @Transform(({ value }) => Number(value))
    grade_class_id: number;

    @ApiProperty({ description: "Subject ids", example: "[1,2,3]" })
    @IsNotEmpty()
    @IsString()
    subject_ids_string: string;

    @ApiProperty({ type: "file", required: false })
    readonly file: any;

    @ApiProperty({ description: "User ID of the associated student user", example: 123 })
    @IsOptional()
    @IsInt()
    student_user_id?: number;

    @ApiProperty({ description: "parent ids", example: "1,2,3" })
    @IsNotEmpty()
    @IsString()
    parent_ids_string: string;

    @ApiProperty()
    @IsOptional()
    @IsInt()
    created_by?: number;
}
