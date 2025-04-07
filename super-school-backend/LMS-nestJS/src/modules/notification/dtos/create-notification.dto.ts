import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsNumber } from "class-validator";

export class CreateNotificationDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    message: string;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    to_user_id?: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    school_id: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    grade_class_id?: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    grade_id?: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    module_id?: number;

    @ApiProperty({ description: "Indicates if the notification is for all users", default: false })
    @IsBoolean()
    @IsOptional()
    show_to_all?: boolean;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    created_by: number;
}
