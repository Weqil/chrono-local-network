import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { SyncArrivalResultEntity } from './sync-arrival-result.entity';

@Entity('sync_arrival_result_laps')
@Unique(['arrivalResultId', 'lapNumber'])
export class SyncArrivalResultLapEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'arrival_result_id', type: 'integer' })
  arrivalResultId: number;

  @Column({ name: 'lap_number', type: 'integer' })
  lapNumber: number;

  @Column({ name: 'lap_time_ms', type: 'integer' })
  lapTimeMs: number;

  @Column({ name: 'timestamp_ms', type: 'integer' })
  timestampMs: number;

  @Column({ name: 'position_on_lap', type: 'integer', default: 0 })
  positionOnLap: number;

  @Column({ name: 'is_manual', type: 'boolean', default: false })
  isManual: boolean;

  @ManyToOne(() => SyncArrivalResultEntity, (result) => result.laps, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'arrival_result_id' })
  arrivalResult: SyncArrivalResultEntity;
}
