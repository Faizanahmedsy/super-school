import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsInt } from "class-validator";

export class UpdateCityDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
    district_name?: string;

    @ApiProperty()
    @IsOptional()
    @IsInt()
    province_id?: number;
}
