import { SyncArrivalEntity } from './entities/sync-arrival.entity';
import { SyncArrivalResultEntity } from './entities/sync-arrival-result.entity';

export class SyncArrivalsPresenter {
  static present(arrival: SyncArrivalEntity) {
    return {
      sync_id: arrival.syncId,
      race_sync_id: arrival.raceSyncId,
      parent_sync_id: arrival.parentSyncId,
      name: arrival.name,
      finished: arrival.finished,
      round_min_time: arrival.roundMinTime,
      time: arrival.time,
      arrival_grades: arrival.arrivalGrades,
      arrival_type_slug: arrival.arrivalTypeSlug,
      created_by: arrival.createdBy,
      version: arrival.version,
      created_at_ms: arrival.createdAtMs,
      updated_at_ms: arrival.updatedAtMs,
      deleted_at_ms: arrival.deletedAtMs,
      finished_at_ms: arrival.finishedAtMs,
      participant_sync_ids: this.parseParticipantSyncIds(arrival.participantSyncIds),
      results: (arrival.results ?? []).map((r) => this.presentResult(r)),
    };
  }

  private static parseParticipantSyncIds(raw: string | null | undefined): string[] {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((id) => String(id ?? '').trim()).filter(Boolean);
    } catch {
      return [];
    }
  }

  private static presentResult(result: SyncArrivalResultEntity) {
    return {
      place: result.place,
      total_laps: result.totalLaps,
      total_time_ms: result.totalTimeMs,
      best_lap_time_ms: result.bestLapTimeMs,
      user: {
        id: result.userId,
        name: result.name,
        surname: result.surname,
        patronymic: result.patronymic,
        start_number: result.startNumber,
        tag_id: result.tagId,
        grade: result.grade,
        command: result.command,
      },
      laps: (result.laps ?? []).map((lap) => ({
        lap_number: lap.lapNumber,
        lap_time_ms: lap.lapTimeMs,
        timestamp_ms: lap.timestampMs,
        position_on_lap: lap.positionOnLap,
        is_manual: lap.isManual,
      })),
    };
  }
}
