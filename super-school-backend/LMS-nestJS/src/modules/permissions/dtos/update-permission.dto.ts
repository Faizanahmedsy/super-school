import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdatePermissionDto {
    @ApiProperty()
    @IsOptional()
    @IsNumber()
    role_id?: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    module_id?: number;

    @ApiProperty({
        example: {
            add: true,
            edit: true,
            delete: true,
            view: true,
        },
    })
    @IsOptional()
    allow?: {
        add: boolean;
        edit: boolean;
        delete: boolean;
        view: boolean;
    };
}
