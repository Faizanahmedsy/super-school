import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, IsNotEmpty, MinLength, Matches } from "class-validator";

export class LoginDto {
    @ApiProperty()
    @IsEmail({}, { message: "Invalid email address" })
    @IsNotEmpty({ message: "Email is required" })
    readonly email: string;

    @ApiProperty()
    @IsString({ message: "Password is required" })
    @IsNotEmpty({ message: "Password is required" })
    @MinLength(6, { message: "Password must be at least 6 characters long" })
    // @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/, {
    //     message: "Password must contain at least one letter and one number",
    // })
    readonly password: string;
}
