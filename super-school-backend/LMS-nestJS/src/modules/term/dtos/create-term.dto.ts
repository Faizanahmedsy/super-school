import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsDate, IsBoolean, IsNumber, IsInt, IsOptional } from "class-validator";

export class CreateTermDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    term_name: string;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    batch_id: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    school_id: number;

    @ApiProperty()
    @IsBoolean()
    @IsNotEmpty()
    status: boolean;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    start_date: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    end_date: string;

    // @IsInt()
    // @IsOptional()
    // start_year: number;
}
