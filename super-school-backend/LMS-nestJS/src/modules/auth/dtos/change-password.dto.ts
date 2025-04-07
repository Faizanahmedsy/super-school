import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength, MaxLength } from "class-validator";

export class ChangePasswordDto {
    @ApiProperty()
    @IsString()
    @MinLength(6)
    @MaxLength(50)
    current_Password: string;

    @ApiProperty()
    @IsString()
    @MinLength(6)
    @MaxLength(50)
    new_password: string;
}
