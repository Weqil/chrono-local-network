export interface ArrivalMeta {
  race_id: number;
  last_lap_number: number;
  stream_opened_at: number;
  arrival_type_id?: number | null;
  arrival_type_slug?: string | null;
  arrival_name?: string | null;
  finish_lap_number?: number | null;
}

export interface ParticipantData {
  id: number;
  name: string;
  surname: string;
  patronymic: string;
  start_number: number;
}

export type ParticipantLiveStatus = 'pending' | 'finished';

export interface ParticipantResult {
  id: number;
  lapCount: number;
  lastLapTimestampMs: number;
  totalRaceTimeMs: number;
  position: number;
  /** + вверх / − вниз / 0 без изменений / null — нет предыдущего состояния */
  position_delta?: number | null;
  displayTimeMs: number;
  laps_behind: number;
  bestLapTimeMs?: number | null;
  lastLapDeltaSec?: number | null;
  status?: ParticipantLiveStatus;
  finishElapsedMs?: number | null;
  participantData: ParticipantData;
}

export interface LiveTimingData {
  arrival_meta: ArrivalMeta;
  participants: ParticipantResult[];
}
