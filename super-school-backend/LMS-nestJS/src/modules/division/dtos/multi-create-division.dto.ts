import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsString, IsEmail, IsNotEmpty, IsOptional, isNumber, IsNumber, MinLength, IsInt, IsArray, ArrayNotEmpty, ValidateNested } from "class-validator";

export class DivisionDto {
    @ApiProperty()
    @IsInt()
    grade_id: number;

    @ApiProperty()
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    division: string[];

    @ApiProperty()
    @IsInt()
    batch_id: number;
}

export class MultiCreateDivisionDto {
    @ApiProperty({
        type: [DivisionDto], // Documenting that this is an array of DivisionDto
        description: "List of divisions for each grade",
        example: [
            {
                grade_id: 1,
                batch_id: 1,
                division: ["A", "B", "C"],
            },
            {
                grade_id: 2,
                batch_id: 1,
                division: ["A", "B", "C"],
            },
        ],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DivisionDto)
    divisions: DivisionDto[];

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    school_id: number;
}
