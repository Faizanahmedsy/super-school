import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, ArrayNotEmpty } from "class-validator";
import { EVENT_TYPE } from "helper/constants";

export class CreateMultiEventDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    school_id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    event_name: string;

    @ApiProperty({
        description: "Event type",
        enum: EVENT_TYPE,
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    type: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    description: string;

    @ApiProperty({
        description: "List of divisions for each grade",
        example: ["1", "2", "3"],
    })
    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    grade_id: string[];

    @ApiProperty({
        description: "List of divisions for each grade",
        example: ["1", "2", "3"],
    })
    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    class_id: string[];

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    start_date: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    end_date: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    start_time: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    end_time: string;

    // @IsNotEmpty()
    // created_by: number;

    // @IsNotEmpty()
    // updated_by: number;
}
