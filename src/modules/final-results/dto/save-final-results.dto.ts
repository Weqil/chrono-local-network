export class FinalResultUserDto {
  id: number;
  name: string;
  surname?: string;
  patronymic?: string;
  start_number: number;
  tag_id?: string;
  grade?: string;
  command?: string;
}

export class FinalResultLapDto {
  lap_number: number;
  lap_time_ms: number;
  timestamp_ms: number;
  position_on_lap?: number;
  is_manual: boolean;
}

export class FinalResultRowDto {
  place?: number;
  total_laps: number;
  total_time_ms: number;
  best_lap_time_ms?: number;
  user: FinalResultUserDto;
  laps: FinalResultLapDto[];
}

export class SaveFinalResultsDto {
  server_arrival_id: number;
  server_race_id: number;
  local_arrival_id: number;
  finished_at_ms: number;
  results: FinalResultRowDto[];
}
