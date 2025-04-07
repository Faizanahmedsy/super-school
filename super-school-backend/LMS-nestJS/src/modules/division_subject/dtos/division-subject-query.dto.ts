import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsNumberString, IsString, IsIn } from "class-validator";

export class DivisionSubjectQueryDto {
    @ApiProperty()
    @IsOptional()
    @IsNumberString({}, { message: "page must be a number conforming to the specified constraints" })
    page?: number;

    @ApiProperty()
    @IsOptional()
    @IsNumberString({}, { message: "limit must be a number conforming to the specified constraints" })
    limit?: number;

    @ApiProperty()
    @IsOptional()
    @IsString()
    @IsIn(["asc", "desc"], { message: "sort must be either asc or desc" })
    sort?: string;
}
