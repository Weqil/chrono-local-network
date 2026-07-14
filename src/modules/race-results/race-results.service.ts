import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { NetworkGateway } from '../network/network.gateway';
import { LiveTimingData } from './interfaces/live-timing-data.interface';
import { StreamStatus } from './interfaces/stream-status.interface';
import { LiveResultsStore } from './live-results.store';
import { RaceResultsCacheService } from './race-results-cache.service';

@Injectable()
export class RaceResultsService implements OnModuleInit {
  private readonly logger = new Logger(RaceResultsService.name);

  constructor(
    private readonly cache: RaceResultsCacheService,
    private readonly networkGateway: NetworkGateway,
    private readonly store: LiveResultsStore,
  ) {}

  async onModuleInit(): Promise<void> {
    const latest = await this.store.getLatest();

    if (latest) {
      this.cache.hydrate(latest.data, latest.updatedAt, latest.isStreamOpen);
      this.logger.log(
        `Restored live snapshot for race ${latest.data.arrival_meta?.race_id} (stream ${latest.isStreamOpen ? 'open' : 'closed'})`,
      );
    }
  }

  async receive(payload: LiveTimingData): Promise<LiveTimingData> {
    const wasClosed = !this.cache.isOpen();
    this.cache.set(payload);
    this.networkGateway.broadcastRaceResults(payload);

    if (wasClosed) {
      this.networkGateway.broadcastStreamStatus(this.cache.getStreamStatus());
    }

    const cached = this.cache.get();
    if (cached) {
      await this.store.save(payload, cached.updated_at, true);
    }

    return payload;
  }

  async closeStream(): Promise<StreamStatus> {
    this.cache.closeStream();
    const status = this.cache.getStreamStatus();
    this.networkGateway.broadcastStreamStatus(status);
    await this.store.setStreamStatus(status.race_id, false);

    return status;
  }

  getStreamStatus(): StreamStatus {
    return this.cache.getStreamStatus();
  }

  getLast() {
    return this.cache.get();
  }
}
