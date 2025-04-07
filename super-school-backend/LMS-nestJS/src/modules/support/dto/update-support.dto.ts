import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Transform, Type } from "class-transformer";

export class UpdateSupport {
    @ApiProperty()
    @IsOptional()
    @IsString()
    description: string;

    @ApiProperty({
        type: [String],
        description: "Array of attachment file URLs or names",
        required: false,
    })
    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    attachment?: string[];

    @ApiProperty()
    @IsOptional()
    @IsInt()
    @Transform(({ value }) => Number(value))
    school_id: number;
}
