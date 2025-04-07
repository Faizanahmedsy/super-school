import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateStateDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    province_name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    country: string;
}
