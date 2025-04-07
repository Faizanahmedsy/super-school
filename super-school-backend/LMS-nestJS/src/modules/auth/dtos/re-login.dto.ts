import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class ReLoginDto {
    @ApiProperty()
    @IsNumber({}, { message: "user_id must be a number" })
    user_id: number;
}
