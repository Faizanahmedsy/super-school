import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class GeneralSettingDto {
    @ApiProperty()
    @IsString()
    @IsOptional()
    theme_primary_color?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    theme_secondary_color?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    logo?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    support_email?: string;
}
