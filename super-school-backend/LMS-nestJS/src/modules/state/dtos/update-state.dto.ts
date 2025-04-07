import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateStateDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
    province_name?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    country?: string;
}
