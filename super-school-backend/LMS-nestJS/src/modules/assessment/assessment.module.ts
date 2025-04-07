import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assessment } from './assessment.entity';
import { AssessmentService } from './assessment.service';
import { AssessmentController } from './assessment.controller';
import { Institute } from '../institutes/institutes.entity';
import { Grade } from '../grade/grade.entity';
import { Division } from '../division/division.entity';
import { Batch } from '../batch/batch.entity';
import { Term } from '../term/term.entity';
import { User } from '../users/user.entity';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Assessment,
      Institute,
      Grade,
      Division,
      Batch,
      Term,
      User,
      AuthModule
    ]),
  ],
  controllers: [AssessmentController],
  providers: [AssessmentService,JwtService],
  exports: [AssessmentService],
})
export class AssessmentModule {}
