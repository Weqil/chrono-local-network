export interface SyncArrivalSyncPayload {
  sync_id: string;
  race_sync_id: string;
  parent_sync_id: string | null;
  name: string;
  finished: boolean;
  round_min_time: number;
  time: string;
  arrival_grades: string;
  arrival_type_slug: string;
  created_by: string;
  version: number;
  created_at_ms: number;
  updated_at_ms: number;
  deleted_at_ms?: number | null;
  finished_at_ms?: number | null;
  participant_sync_ids: string[];
  results: Array<{
    place?: number | null;
    total_laps: number;
    total_time_ms: number;
    best_lap_time_ms?: number | null;
    user: {
      id: number;
      name: string;
      surname?: string;
      patronymic?: string;
      start_number: number;
      tag_id?: string;
      grade?: string;
      command?: string;
    };
    laps: Array<{
      lap_number: number;
      lap_time_ms: number;
      timestamp_ms: number;
      position_on_lap?: number | null;
      is_manual: boolean;
    }>;
  }>;
}
