import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional } from "class-validator";

export class UpdateModuleDto {
    @IsString()
    @IsOptional()
    @ApiProperty()
    module_name?: string;
}
