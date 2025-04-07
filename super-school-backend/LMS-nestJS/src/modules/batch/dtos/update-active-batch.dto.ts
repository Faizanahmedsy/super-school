import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsInt, IsString, Length, IsOptional, IsNumber } from "class-validator";

export class UpdateBatchActiveDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    batch_id?: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    school_id?: number;
}
