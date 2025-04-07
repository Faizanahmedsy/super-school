import { IsOptional, IsString } from "class-validator";

export class GetTeachersDto {
    @IsOptional()
    @IsString()
    sortField?: string;

    @IsOptional()
    @IsString()
    sort?: string;

    @IsOptional()
    @IsString()
    limit?: string;

    @IsOptional()
    @IsString()
    page?: string;
}
