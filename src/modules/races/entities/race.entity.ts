import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('sync_races')
export class RaceEntity {
  @PrimaryColumn({ name: 'sync_id', type: 'text' })
  syncId: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  grades: string;

  @Column({ name: 'server_race_id', type: 'integer', nullable: true })
  serverRaceId: number | null;

  @Column({ name: 'created_by', type: 'text' })
  createdBy: string;

  @Column({ type: 'integer', default: 1 })
  version: number;

  @Column({ name: 'created_at_ms', type: 'integer' })
  createdAtMs: number;

  @Column({ name: 'updated_at_ms', type: 'integer' })
  updatedAtMs: number;
}
