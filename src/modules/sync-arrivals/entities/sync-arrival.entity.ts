import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { SyncArrivalResultEntity } from './sync-arrival-result.entity';

@Entity('sync_arrivals')
export class SyncArrivalEntity {
  @PrimaryColumn({ name: 'sync_id', type: 'text' })
  syncId: string;

  @Column({ name: 'race_sync_id', type: 'text' })
  raceSyncId: string;

  @Column({ name: 'parent_sync_id', type: 'text', nullable: true })
  parentSyncId: string | null;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'boolean', default: false })
  finished: boolean;

  @Column({ name: 'round_min_time', type: 'integer', default: 0 })
  roundMinTime: number;

  @Column({ type: 'text', default: '' })
  time: string;

  @Column({ name: 'arrival_grades', type: 'text' })
  arrivalGrades: string;

  @Column({ name: 'arrival_type_slug', type: 'text', default: 'regular' })
  arrivalTypeSlug: string;

  @Column({ name: 'finished_at_ms', type: 'integer', nullable: true })
  finishedAtMs: number | null;

  @Column({ name: 'created_by', type: 'text' })
  createdBy: string;

  @Column({ type: 'integer', default: 1 })
  version: number;

  @Column({ name: 'created_at_ms', type: 'integer' })
  createdAtMs: number;

  @Column({ name: 'updated_at_ms', type: 'integer' })
  updatedAtMs: number;

  @Column({ name: 'deleted_at_ms', type: 'integer', nullable: true })
  deletedAtMs: number | null;

  @Column({ name: 'participant_sync_ids', type: 'text', default: '[]' })
  participantSyncIds: string;

  @OneToMany(() => SyncArrivalResultEntity, (result) => result.arrival, {
    cascade: true,
  })
  results: SyncArrivalResultEntity[];
}
