import { RaceUserEntity } from './entities/race-user.entity';
import { RaceUserSyncPayload } from './interfaces/race-user-sync-payload.interface';

export class RaceUsersPresenter {
  static present(entity: RaceUserEntity): RaceUserSyncPayload {
    return {
      sync_id: entity.syncId,
      race_sync_id: entity.raceSyncId,
      name: entity.name,
      surname: entity.surname,
      patronymic: entity.patronymic,
      start_number: entity.startNumber,
      grade: entity.grade,
      command: entity.command,
      tags: entity.tags,
      created_by: entity.createdBy,
      version: entity.version,
      created_at_ms: entity.createdAtMs,
      updated_at_ms: entity.updatedAtMs,
      deleted_at_ms: entity.deletedAtMs ?? null,
    };
  }
}
