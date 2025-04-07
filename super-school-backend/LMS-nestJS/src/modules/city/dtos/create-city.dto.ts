import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsInt } from "class-validator";

export class CreateCityDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    district_name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    province_id: number;
}
