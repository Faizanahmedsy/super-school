import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
    IsString,
    IsEmail,
    IsNotEmpty,
    IsOptional,
    isNumber,
    IsNumber,
    MinLength,
    IsInt,
    IsArray,
    ArrayNotEmpty,
    ValidateNested,
    IsBoolean,
} from "class-validator";
import { CreateParentDto } from "src/modules/parents/dtos/create-parents.dto";

export class ParentDto {
    @ApiProperty()
    @IsOptional()
    first_name: string;

    @ApiProperty()
    @IsOptional()
    last_name: string;

    @ApiProperty()
    @IsOptional()
    relationship: string;

    @ApiProperty()
    @IsEmail({}, { message: "Email format is invalid" })
    @IsOptional()
    email: string;

    @ApiProperty({
        description: "Mobile number with country code",
        example: "+1234567890",
        pattern: "^[+\\d][\\d]{9,14}$",
    })
    @IsNumber()
    @IsOptional()
    mobile_number: string;
}

export class MultiCreateParentsDto {
    @ApiProperty({
        type: [ParentDto],
        description: "List of parents for the student",
        example: [
            {
                first_name: "Jane",
                last_name: "Doe",
                email: "jane.doe@example.com",
                mobile_number: "+1234567890",
                relationship: "father",
            },
        ],
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ParentDto)
    parents?: ParentDto[];
}

export class UpdateStudentDto {
    @IsOptional()
    @IsArray()
    parents?: {
      first_name: string;
      last_name: string;
      email: string;
      mobile_number: string;
      relationship: string;
    }[];
    // other fields...
  }
  
