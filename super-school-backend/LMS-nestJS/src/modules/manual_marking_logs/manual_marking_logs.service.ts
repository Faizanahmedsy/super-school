import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ManualMarkingLog } from './manual_marking_logs.entity';
import { CreateManualMarkingLogDto } from './dtos/create-manual-marking-logs.dto';
import { UpdateManualMarkingLogDto } from './dtos/updtae-manual-marking-logs.dto';

@Injectable()
export class ManualMarkingLogService {
  constructor(
    @InjectRepository(ManualMarkingLog)
    private readonly manualMarkingLogRepository: Repository<ManualMarkingLog>
  ) {}

  async createManualMarkingLog(createManualMarkingLogDto: CreateManualMarkingLogDto): Promise<ManualMarkingLog> {
    try {
      const newLog = this.manualMarkingLogRepository.create(createManualMarkingLogDto);
      return await this.manualMarkingLogRepository.save(newLog);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create manual marking log');
    }
  }

  async getManualMarkingLogs(query: any): Promise<{ totalCount: number; totalPages: number; currentPage: number; list: ManualMarkingLog[] }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const offset = (page - 1) * limit;
    const [logs, totalCount] = await this.manualMarkingLogRepository.findAndCount({
      skip: offset,
      take: limit,
    });

    return {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      list: logs,
    };
  }

  async getManualMarkingLogById(id: number): Promise<ManualMarkingLog> {
    const log = await this.manualMarkingLogRepository.findOne({ where: { id } });
    if (!log) {
      throw new NotFoundException(`Manual marking log with ID ${id} not found`);
    }
    return log;
  }

  async updateManualMarkingLog(id: number, updateManualMarkingLogDto: UpdateManualMarkingLogDto): Promise<ManualMarkingLog> {
    const log = await this.getManualMarkingLogById(id);
    Object.assign(log, updateManualMarkingLogDto);
    return await this.manualMarkingLogRepository.save(log);
  }

  async deleteManualMarkingLog(id: number): Promise<void> {
    const log = await this.getManualMarkingLogById(id);
    if (!log) {
      throw new NotFoundException(`Manual marking log with ID ${id} not found`);
    }
    await this.manualMarkingLogRepository.remove(log);
  }
}
