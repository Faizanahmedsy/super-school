import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNumber, IsOptional } from "class-validator";

export class UpdateEventDto {
    @ApiProperty()
    @IsOptional()
    @IsNumber()
    school_id?: number;

    @ApiProperty()
    @IsOptional()
    @IsString()
    event_name?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    start_date?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    end_date?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    start_time?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    end_time?: string;
}
