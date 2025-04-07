import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManualMarkingLog } from './manual_marking_logs.entity';
import { ManualMarkingController } from './manual_marking_logs.controller';
import { ManualMarkingLogService } from './manual_marking_logs.service';
import { JwtService } from '@nestjs/jwt';


@Module({
  imports: [TypeOrmModule.forFeature([ManualMarkingLog])],
  controllers: [ManualMarkingController],
  providers: [ManualMarkingLogService,JwtService],
  exports: [ManualMarkingLogService],
})
export class ManualMarkingLogModule {}
