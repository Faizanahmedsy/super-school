import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsInt, IsString, Length, IsOptional, IsNumber } from "class-validator";

export class UpdateBatchDto {
    @IsInt()
    @IsNotEmpty()
    @ApiProperty()
    start_year?: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    school_id?: number;

    
}
