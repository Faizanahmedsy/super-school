import { IsString, IsOptional, IsNotEmpty, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateSubjectDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    school_id?: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    master_subject_id?: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    grade_id?: number;

    // @ApiProperty()
    // @IsNotEmpty()
    // @IsNumber()
    // term_id?: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    batch_id?: number;
}
