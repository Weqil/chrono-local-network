import {
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { ArrivalResultEntity } from './arrival-result.entity';

@Entity('arrivals')
export class ArrivalEntity {
  @PrimaryColumn({ type: 'integer' })
  id: number;

  @Column({ name: 'server_race_id', type: 'integer' })
  serverRaceId: number;

  @Column({ name: 'local_arrival_id', type: 'integer', nullable: true })
  localArrivalId: number | null;

  @Column({ name: 'finished_at_ms', type: 'integer', nullable: true })
  finishedAtMs: number | null;

  @Column({ type: 'text', default: '' })
  name: string;

  @Column({ type: 'text', default: '' })
  time: string;

  @Column({ name: 'arrival_type_id', type: 'integer', nullable: true })
  arrivalTypeId: number | null;

  @Column({ name: 'arrival_type_name', type: 'text', nullable: true })
  arrivalTypeName: string | null;

  @Column({ name: 'arrival_type_slug', type: 'text', nullable: true })
  arrivalTypeSlug: string | null;

  @OneToMany(() => ArrivalResultEntity, (result) => result.arrival, {
    cascade: true,
  })
  results: ArrivalResultEntity[];
}
