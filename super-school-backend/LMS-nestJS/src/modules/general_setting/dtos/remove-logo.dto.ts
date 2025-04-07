import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";

export class RemoveLogoDto {
    @ApiProperty({ description: "School ID", example: 1 })
    @IsNotEmpty()
    @IsInt()
    @Transform(({ value }) => Number(value))
    school_id: number;
}
