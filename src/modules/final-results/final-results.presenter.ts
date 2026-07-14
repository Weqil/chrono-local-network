import { ArrivalEntity } from './entities/arrival.entity';
import { ArrivalResultEntity } from './entities/arrival-result.entity';

export class FinalResultsPresenter {
  static presentArrival(arrival: ArrivalEntity) {
    const firstResult = arrival.results?.[0];

    if (!arrival.finishedAtMs || !firstResult) {
      return null;
    }

    return {
      server_arrival_id: arrival.id,
      server_race_id: firstResult.serverRaceId,
      local_arrival_id: arrival.localArrivalId,
      finished_at_ms: arrival.finishedAtMs,
      name: arrival.name,
      time: arrival.time,
      arrival_type:
        arrival.arrivalTypeId !== null
          ? {
              id: arrival.arrivalTypeId,
              name: arrival.arrivalTypeName ?? '',
              slug: arrival.arrivalTypeSlug ?? '',
            }
          : null,
      results: (arrival.results ?? []).map((result) => this.presentResult(result)),
    };
  }

  static presentRace(raceId: number, arrivals: ArrivalEntity[]) {
    return {
      server_race_id: raceId,
      arrivals: arrivals
        .map((arrival) => this.presentArrival(arrival))
        .filter((item) => item !== null),
    };
  }

  private static presentResult(result: ArrivalResultEntity) {
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
