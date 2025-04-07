import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsInt, IsString, Length, IsNumber, IsOptional, IsBoolean } from "class-validator";
import { Column } from "typeorm";

export class CreateBatchDto {
    @ApiProperty()
    @IsInt()
    @IsNotEmpty()
    @Column({ nullable: false })
    start_year: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    school_id: number;

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    is_active: boolean;
}
