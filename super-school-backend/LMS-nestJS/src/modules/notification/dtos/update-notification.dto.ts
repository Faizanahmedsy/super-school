import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";

export class UpdateNotificationDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    is_read?: boolean;
}
