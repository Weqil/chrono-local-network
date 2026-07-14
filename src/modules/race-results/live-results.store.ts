import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LiveTimingData } from './interfaces/live-timing-data.interface';
import { LiveResultSnapshotEntity } from './entities/live-result-snapshot.entity';

export interface RestoredSnapshot {
  data: LiveTimingData;
  updatedAt: string;
  isStreamOpen: boolean;
}

@Injectable()
export class LiveResultsStore {
  private readonly logger = new Logger(LiveResultsStore.name);

  constructor(
    @InjectRepository(LiveResultSnapshotEntity)
    private readonly repository: Repository<LiveResultSnapshotEntity>,
  ) {}

  async save(
    payload: LiveTimingData,
    updatedAt: string,
    isStreamOpen: boolean,
  ): Promise<void> {
    const raceId = payload.arrival_meta?.race_id;

    if (raceId === undefined || raceId === null) {
      return;
    }

    try {
      await this.repository.save(
        this.repository.create({
          raceId,
          payload: JSON.stringify(payload),
          isStreamOpen,
          updatedAt,
        }),
      );
    } catch (error) {
      this.logger.error(
        `Failed to persist live snapshot for race ${raceId}`,
        error as Error,
      );
    }
  }

  async setStreamStatus(
    raceId: number | null,
    isStreamOpen: boolean,
  ): Promise<void> {
    if (raceId === null) {
      return;
    }

    try {
      await this.repository.update({ raceId }, { isStreamOpen });
    } catch (error) {
      this.logger.error(
        `Failed to update stream status for race ${raceId}`,
        error as Error,
      );
    }
  }

  async getLatest(): Promise<RestoredSnapshot | null> {
    const [row] = await this.repository.find({
      order: { updatedAt: 'DESC' },
      take: 1,
    });

    if (!row) {
      return null;
    }

    return {
      data: JSON.parse(row.payload) as LiveTimingData,
      updatedAt: row.updatedAt,
      isStreamOpen: row.isStreamOpen,
    };
  }
}
