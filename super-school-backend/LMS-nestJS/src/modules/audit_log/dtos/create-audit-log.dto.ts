import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsNumber, IsJSON } from "class-validator";

export class CreateAuditLogDto {
    @ApiProperty()
    @IsOptional()
    @IsNumber()
    role_id?: number;

    @ApiProperty()
    @IsString()
    action: string;

    @ApiProperty()
    @IsString()
    message: string;

    @ApiProperty()
    @IsOptional()
    @IsJSON()
    old_data?: any;

    @ApiProperty()
    @IsOptional()
    @IsJSON()
    new_data?: any;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    action_user_id?: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    school_id?: number;
}
