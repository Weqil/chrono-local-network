import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SyncArrivalEntity } from './sync-arrival.entity';
import { SyncArrivalResultLapEntity } from './sync-arrival-result-lap.entity';

@Entity('sync_arrival_results')
export class SyncArrivalResultEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'arrival_sync_id', type: 'text' })
  arrivalSyncId: string;

  @Column({ type: 'integer', default: 0 })
  place: number;

  @Column({ name: 'total_laps', type: 'integer' })
  totalLaps: number;

  @Column({ name: 'total_time_ms', type: 'integer' })
  totalTimeMs: number;

  @Column({ name: 'best_lap_time_ms', type: 'integer', default: 0 })
  bestLapTimeMs: number;

  @Column({ name: 'user_id', type: 'integer' })
  userId: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', default: '' })
  surname: string;

  @Column({ type: 'text', default: '' })
  patronymic: string;

  @Column({ name: 'start_number', type: 'integer' })
  startNumber: number;

  @Column({ name: 'tag_id', type: 'text', default: '' })
  tagId: string;

  @Column({ type: 'text', default: '' })
  grade: string;

  @Column({ type: 'text', default: '' })
  command: string;

  @ManyToOne(() => SyncArrivalEntity, (arrival) => arrival.results, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'arrival_sync_id', referencedColumnName: 'syncId' })
  arrival: SyncArrivalEntity;

  @OneToMany(() => SyncArrivalResultLapEntity, (lap) => lap.arrivalResult, {
    cascade: true,
  })
  laps: SyncArrivalResultLapEntity[];
}
