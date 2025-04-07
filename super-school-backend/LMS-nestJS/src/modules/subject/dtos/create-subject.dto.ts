import { IsString, IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateSubjectDto {
    @ApiProperty()
    @IsOptional()
    @IsNumber()
    school_id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    master_subject_id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    grade_id: number;

    // @ApiProperty()
    // @IsNotEmpty()
    // @IsNumber()
    // term_id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    batch_id: number;
}
