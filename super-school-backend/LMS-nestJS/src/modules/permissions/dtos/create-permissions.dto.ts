import { IsBoolean, IsNotEmpty, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreatePermissionDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    role_id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    module_id: number;

    @ApiProperty({
        example: {
            add: true,
            edit: true,
            delete: true,
            view: true,
        },
    })
    @IsNotEmpty()
    allow: {
        add: boolean;
        edit: boolean;
        delete: boolean;
        view: boolean;
    };
}
