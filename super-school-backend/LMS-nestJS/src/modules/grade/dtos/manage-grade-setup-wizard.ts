import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsString, IsNotEmpty, IsNumber, IsArray, ValidateNested, IsOptional } from "class-validator";

export class GradeDto {
    @ApiProperty({ example: 8 })
    @IsNotEmpty()
    @IsNumber()
    grade_number: number;

    @ApiProperty({ example: "description" })
    @IsOptional()
    @IsString()
    description: string;
}

export class MultiCreateGradeDtoForSetupWizard {
    @ApiProperty({
        type: [GradeDto], // Specify the type as an array of GradeDto objects
        example: [
            { grade_number: 8, description: "Description", batch_id: 2 },
            { grade_number: 9, description: "Another Description", batch_id: 2 },
        ],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => GradeDto)
    grads: GradeDto[];

    @ApiProperty({ example: 1 })
    @IsNotEmpty()
    @IsNumber()
    batch_id: number;

    @ApiProperty({ example: 1 })
    @IsOptional()
    @IsNumber()
    school_id: number;
}
