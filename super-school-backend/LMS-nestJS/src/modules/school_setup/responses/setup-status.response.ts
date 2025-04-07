import { ApiProperty } from "@nestjs/swagger";
import { SetupStep } from "helper/constants";

export class SetupStatusResponse {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 1 })
    admin_id: number;

    @ApiProperty({
        enum: SetupStep,
        example: SetupStep.CREATE_GRADES,
    })
    current_step: string;

    @ApiProperty({
        example: { academicYear: "2024-2025" },
        nullable: true,
    })
    year_data: any;

    @ApiProperty({
        example: [{ name: "Grade 1" }],
        nullable: true,
    })
    grades_data: any;

    @ApiProperty({
        example: [{ name: "1A", grade: "Grade 1" }],
        nullable: true,
    })
    classes_data: any;

    @ApiProperty({
        example: [{ name: "Mathematics", grade: "Grade 1" }],
        nullable: true,
    })
    subjects_data: any;

    @ApiProperty({ example: false })
    is_completed: boolean;

    @ApiProperty()
    created_at: Date;

    @ApiProperty()
    updated_at: Date;
}
