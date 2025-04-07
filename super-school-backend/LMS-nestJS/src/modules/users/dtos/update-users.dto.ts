import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsEmail, IsString, MinLength, IsNumber, IsNotEmpty, IsPhoneNumber, isNumber, Matches } from "class-validator";

export class UpdateUserDto {
    @ApiProperty()
    @IsEmail({}, { message: "Email format is invalid" })
    @IsString()
    @IsNotEmpty()
    email?: string;

    @ApiProperty()
    @IsString()
    @MinLength(6, { message: "Password must be at least 6 characters long" })
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/, {
        message: "Password must contain at least one letter, one number, and can include special characters",
    })
    password?: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    user_name?: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    role_id?: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    status?: string;
}
