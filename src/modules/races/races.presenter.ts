import { RaceEntity } from './entities/race.entity';
import { RaceSyncPayload } from './interfaces/race-sync-payload.interface';

export class RacesPresenter {
  static present(race: RaceEntity): RaceSyncPayload {
    return {
      sync_id: race.syncId,
      name: race.name,
      grades: race.grades,
      server_race_id: race.serverRaceId,
      created_by: race.createdBy,
      version: race.version,
      created_at_ms: race.createdAtMs,
      updated_at_ms: race.updatedAtMs,
      deleted_at_ms: race.deletedAtMs ?? null,
    };
  }
}
