import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class CreateEventDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    school_id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    event_name: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    description: string;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    class_id: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    division_id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    start_date: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    end_date: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    start_time: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    end_time: string;
}
