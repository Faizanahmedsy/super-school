import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsDate, IsBoolean, IsNumber } from "class-validator";

export class UpdateTermDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
    term_name?: string;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    batch_id?: number;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    school_id?: number;

    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    status?: boolean;

    @ApiProperty()
    @IsString()
    @IsOptional()
    start_date?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    end_date?: string;

}
