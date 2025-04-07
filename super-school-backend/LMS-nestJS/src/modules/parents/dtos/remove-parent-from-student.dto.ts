import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsString } from "class-validator";
import { Transform } from "class-transformer";

export class RemoveParentFromStudentDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @Transform(({ value }) => Number(value))
    parentId: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @Transform(({ value }) => Number(value))
    studentId: number;
}
