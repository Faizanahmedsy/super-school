import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class ResetPasswordDto {
    @ApiProperty()
    @IsString()
    @MinLength(6, { message: "Password must be at least 6 characters long" })
    // @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/, {
    //     message: "Password must contain at least one letter and one number",
    // })
    readonly new_password: string;

    @ApiProperty()
    @IsString()
    readonly token: string;
}
