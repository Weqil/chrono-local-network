import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('sync_race_users')
export class RaceUserEntity {
  @PrimaryColumn({ name: 'sync_id', type: 'text' })
  syncId: string;

  @Column({ name: 'race_sync_id', type: 'text' })
  raceSyncId: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  surname: string;

  @Column({ type: 'text', nullable: true })
  patronymic: string | null;

  @Column({ name: 'start_number', type: 'integer' })
  startNumber: number;

  @Column({ type: 'text' })
  grade: string;

  @Column({ type: 'text', nullable: true })
  command: string | null;

  @Column({ type: 'text' })
  tags: string;

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
}
