import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, isNumber, IsNumber, IsOptional, IsPhoneNumber, IsString, Matches, MinLength } from "class-validator";

export class CreateUserDto {
    @ApiProperty()
    @IsEmail({}, { message: "Email format is invalid" })
    @IsString()
    @IsNotEmpty()
    email: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MinLength(6, { message: "Password must be at least 6 characters long" })
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/, {
        message: "Password must contain at least one letter, one number, and can include special characters",
    })
    password: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    user_name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    role_id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    status: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    created_by: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    updated_by: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    deleted_by: number;
}
