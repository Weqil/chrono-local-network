import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ArrivalEntity } from './arrival.entity';
import { ArrivalResultLapEntity } from './arrival-result-lap.entity';

@Entity('arrival_results')
export class ArrivalResultEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'arrival_id', type: 'integer' })
  arrivalId: number;

  @Column({ name: 'server_race_id', type: 'integer' })
  serverRaceId: number;

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

  @ManyToOne(() => ArrivalEntity, (arrival) => arrival.results, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'arrival_id' })
  arrival: ArrivalEntity;

  @OneToMany(() => ArrivalResultLapEntity, (lap) => lap.arrivalResult, {
    cascade: true,
  })
  laps: ArrivalResultLapEntity[];
}
