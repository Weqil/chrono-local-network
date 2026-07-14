export interface RaceSyncPayload {
  sync_id: string;
  name: string;
  grades: string;
  server_race_id: number | null;
  created_by: string;
  version: number;
  created_at_ms: number;
  updated_at_ms: number;
}
