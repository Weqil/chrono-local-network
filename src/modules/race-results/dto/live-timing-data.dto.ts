export class ArrivalMetaDto {
  race_id: number;
  last_lap_number: number;
  stream_opened_at: number;
  arrival_type_id?: number | null;
  arrival_type_slug?: string | null;
  arrival_name?: string | null;
}

export class ParticipantDataDto {
  id: number;
  name: string;
  surname: string;
  patronymic: string;
  start_number: number;
}

export class ParticipantResultDto {
  id: number;
  lapCount: number;
  lastLapTimestampMs: number;
  totalRaceTimeMs: number;
  position: number;
  displayTimeMs: number;
  laps_behind: number;
  bestLapTimeMs?: number | null;
  lastLapDeltaSec?: number | null;
  participantData: ParticipantDataDto;
}

export class LiveTimingDataDto {
  arrival_meta: ArrivalMetaDto;
  participants: ParticipantResultDto[];
}
