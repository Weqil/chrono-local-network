export class SyncArrivalResultLapDto {
  lap_number: number;
  lap_time_ms: number;
  timestamp_ms: number;
  position_on_lap?: number | null;
  is_manual: boolean;
}

export class SyncArrivalResultUserDto {
  id: number;
  name: string;
  surname?: string;
  patronymic?: string;
  start_number: number;
  tag_id?: string;
  grade?: string;
  command?: string;
}

export class SyncArrivalResultRowDto {
  place?: number | null;
  total_laps: number;
  total_time_ms: number;
  best_lap_time_ms?: number | null;
  user: SyncArrivalResultUserDto;
  laps: SyncArrivalResultLapDto[];
}

export class UpsertSyncArrivalDto {
  sync_id: string;
  race_sync_id: string;
  parent_sync_id?: string | null;
  name: string;
  finished: boolean;
  round_min_time: number;
  time: string;
  arrival_grades: string;
  arrival_type_slug: string;
  created_by: string;
  version?: number;
  updated_at_ms?: number;
  finished_at_ms?: number | null;
  close_stream?: boolean;
  participant_sync_ids?: string[];
  results: SyncArrivalResultRowDto[];
}

export class DeleteSyncArrivalDto {
  created_by?: string;
}
