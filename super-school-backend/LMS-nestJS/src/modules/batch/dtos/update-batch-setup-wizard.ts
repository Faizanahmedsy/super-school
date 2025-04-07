import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsInt, IsNumber, IsOptional, IsBoolean } from "class-validator";
import { Column } from "typeorm";

export class UpdateBatchForSetUpWizard {
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
    @IsNotEmpty()
    @IsBoolean()
    is_active: boolean;
}
