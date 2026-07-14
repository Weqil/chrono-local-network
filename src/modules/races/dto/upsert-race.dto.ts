export class UpsertRaceDto {
  sync_id: string;
  name: string;
  grades: string;
  server_race_id?: number | null;
  created_by: string;
  version?: number;
  updated_at_ms?: number;
}
