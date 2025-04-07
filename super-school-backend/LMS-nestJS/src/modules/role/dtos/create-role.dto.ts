import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { ROLE } from "../../../../helper/constants";

export class CreateRoleDto {
    @IsEnum(ROLE)
    @ApiProperty({
        description: "The role of the user",
        enum: ROLE,

        required: true,
    })
    @ApiProperty()
    @IsString()
    role_name: string;

    @ApiProperty()
    @IsString()
    role_name_show: string;
}
