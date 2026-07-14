import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('live_result_snapshots')
export class LiveResultSnapshotEntity {
  @PrimaryColumn({ name: 'race_id', type: 'integer' })
  raceId: number;

  @Column({ type: 'text' })
  payload: string;

  @Column({ name: 'is_stream_open', type: 'boolean', default: true })
  isStreamOpen: boolean;

  @Column({ name: 'updated_at', type: 'text' })
  updatedAt: string;
}
