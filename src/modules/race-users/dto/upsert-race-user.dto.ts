export class UpsertRaceUserDto {
  sync_id: string;
  race_sync_id: string;
  name: string;
  surname: string;
  patronymic?: string | null;
  start_number: number;
  grade: string;
  command?: string | null;
  tags: string;
  created_by: string;
  version?: number;
  updated_at_ms?: number;
}
