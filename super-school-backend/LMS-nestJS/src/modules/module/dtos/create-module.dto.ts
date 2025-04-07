import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty } from "class-validator";

export class CreateModuleDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    module_name: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    module_name_show: string;
}
