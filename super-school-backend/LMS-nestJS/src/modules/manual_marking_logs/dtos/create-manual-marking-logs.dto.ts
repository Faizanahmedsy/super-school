import { ApiProperty } from '@nestjs/swagger';
import { IsJSON, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateManualMarkingLogDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
  digitalMarkingId?: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  schoolId?: number;

  @ApiProperty()
  @IsJSON()
  @IsNotEmpty()
  before?: Record<string, any>;

  @ApiProperty()
  @IsJSON()
  @IsNotEmpty()
  after?: Record<string, any>;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  doneById?: number;
}
