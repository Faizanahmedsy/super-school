import { ApiProperty } from '@nestjs/swagger';
import { IsJSON, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';

export class UpdateManualMarkingLogDto {
    @ApiProperty()
    @IsOptional()
    @IsNumber()
  digitalMarkingId?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  schoolId?: number;

  @ApiProperty()
  @IsJSON()
  @IsOptional()
  before?: Record<string, any>;

  @ApiProperty()
  @IsJSON()
  @IsOptional()
  after?: Record<string, any>;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  doneById?: number;
}
