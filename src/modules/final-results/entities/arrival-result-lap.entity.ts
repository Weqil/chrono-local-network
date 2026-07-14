import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ArrivalResultEntity } from './arrival-result.entity';

@Entity('arrival_result_laps')
@Unique(['arrivalResultId', 'lapNumber'])
export class ArrivalResultLapEntity {
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

  @ManyToOne(() => ArrivalResultEntity, (result) => result.laps, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'arrival_result_id' })
  arrivalResult: ArrivalResultEntity;
}
