import { Injectable } from '@nestjs/common';
import { LiveTimingData } from './interfaces/live-timing-data.interface';
import { StreamStatus } from './interfaces/stream-status.interface';

@Injectable()
export class RaceResultsCacheService {
  private lastPayload: LiveTimingData | null = null;
  private updatedAt: string | null = null;
  private isStreamOpen = false;

  set(payload: LiveTimingData): void {
    this.lastPayload = payload;
    this.updatedAt = new Date().toISOString();
    this.isStreamOpen = true;
  }

  hydrate(
    payload: LiveTimingData,
    updatedAt: string,
    isStreamOpen: boolean,
  ): void {
    this.lastPayload = payload;
    this.updatedAt = updatedAt;
    this.isStreamOpen = isStreamOpen;
  }

  closeStream(): void {
    this.isStreamOpen = false;
  }

  isOpen(): boolean {
    return this.isStreamOpen;
  }

  getStreamStatus(): StreamStatus {
    const meta = this.lastPayload?.arrival_meta;

    return {
      race_id: meta?.race_id ?? null,
      is_stream_open: this.isStreamOpen,
      arrival_name: meta?.arrival_name ?? null,
      arrival_type_id: meta?.arrival_type_id ?? null,
    };
  }

  get():
    | {
        data: LiveTimingData;
        updated_at: string;
      }
    | null {
    if (!this.lastPayload || !this.updatedAt) {
      return null;
    }

    return {
      data: this.lastPayload,
      updated_at: this.updatedAt,
    };
  }
}
