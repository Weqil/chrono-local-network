import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { NetworkGateway } from '../network/network.gateway';
import { RaceEntity } from '../races/entities/race.entity';
import { RaceResultsService } from '../race-results/race-results.service';
import { DeleteSyncArrivalDto, UpsertSyncArrivalDto } from './dto/upsert-sync-arrival.dto';
import { SyncArrivalEntity } from './entities/sync-arrival.entity';
import { SyncArrivalResultEntity } from './entities/sync-arrival-result.entity';
import { SyncArrivalResultLapEntity } from './entities/sync-arrival-result-lap.entity';
import { SyncArrivalsPresenter } from './sync-arrivals.presenter';

@Injectable()
export class SyncArrivalsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(SyncArrivalEntity)
    private readonly arrivalsRepository: Repository<SyncArrivalEntity>,
    @InjectRepository(RaceEntity)
    private readonly racesRepository: Repository<RaceEntity>,
    private readonly networkGateway: NetworkGateway,
    private readonly raceResultsService: RaceResultsService,
  ) {}

  async upsert(dto: UpsertSyncArrivalDto) {
    this.assertValidDto(dto);
    await this.assertRaceExists(dto.race_sync_id);

    const existing = await this.arrivalsRepository.findOne({
      where: { syncId: dto.sync_id },
    });

    const now = Date.now();

    if (existing) {
      if (existing.deletedAtMs != null) {
        throw new ConflictException({
          message: 'Arrival has been deleted',
          current: SyncArrivalsPresenter.present(existing),
        });
      }

      if (dto.version != null && dto.version < existing.version) {
        throw new ConflictException({
          message: 'Stale arrival version',
          current: SyncArrivalsPresenter.present(existing),
        });
      }
    }

    await this.dataSource.transaction(async (manager) => {
      const arrivalsRepo = manager.getRepository(SyncArrivalEntity);
      const resultsRepo = manager.getRepository(SyncArrivalResultEntity);
      const lapsRepo = manager.getRepository(SyncArrivalResultLapEntity);

      let arrival = existing;
      const participantSyncIdsJson = JSON.stringify(
        Array.isArray(dto.participant_sync_ids)
          ? dto.participant_sync_ids.map((id) => String(id ?? '').trim()).filter(Boolean)
          : [],
      );

      if (!arrival) {
        arrival = arrivalsRepo.create({
          syncId: dto.sync_id,
          raceSyncId: dto.race_sync_id,
          parentSyncId: dto.parent_sync_id ?? null,
          name: dto.name.trim(),
          finished: dto.finished,
          roundMinTime: dto.round_min_time,
          time: dto.time,
          arrivalGrades: dto.arrival_grades,
          arrivalTypeSlug: dto.arrival_type_slug,
          finishedAtMs: dto.finished_at_ms ?? null,
          createdBy: dto.created_by,
          version: 1,
          createdAtMs: now,
          updatedAtMs: dto.updated_at_ms ?? now,
          deletedAtMs: null,
          participantSyncIds: participantSyncIdsJson,
        });
      } else {
        arrival.raceSyncId = dto.race_sync_id;
        arrival.parentSyncId = dto.parent_sync_id ?? null;
        arrival.name = dto.name.trim();
        arrival.finished = dto.finished;
        arrival.roundMinTime = dto.round_min_time;
        arrival.time = dto.time;
        arrival.arrivalGrades = dto.arrival_grades;
        arrival.arrivalTypeSlug = dto.arrival_type_slug;
        arrival.finishedAtMs = dto.finished_at_ms ?? arrival.finishedAtMs;
        arrival.createdBy = dto.created_by;
        arrival.version = arrival.version + 1;
        arrival.updatedAtMs = dto.updated_at_ms ?? now;
        arrival.participantSyncIds = participantSyncIdsJson;
      }

      await arrivalsRepo.save(arrival);

      const existingResults = await resultsRepo.find({
        where: { arrivalSyncId: dto.sync_id },
        select: { id: true },
      });

      if (existingResults.length > 0) {
        const resultIds = existingResults.map((r) => r.id);
        await lapsRepo
          .createQueryBuilder()
          .delete()
          .where('arrival_result_id IN (:...resultIds)', { resultIds })
          .execute();
        await resultsRepo.delete({ arrivalSyncId: dto.sync_id });
      }

      for (const row of dto.results ?? []) {
        const result = await resultsRepo.save(
          resultsRepo.create({
            arrivalSyncId: dto.sync_id,
            place: row.place ?? 0,
            totalLaps: row.total_laps,
            totalTimeMs: row.total_time_ms,
            bestLapTimeMs: row.best_lap_time_ms ?? 0,
            userId: row.user.id,
            name: row.user.name,
            surname: row.user.surname ?? '',
            patronymic: row.user.patronymic ?? '',
            startNumber: row.user.start_number,
            tagId: row.user.tag_id ?? '',
            grade: row.user.grade ?? '',
            command: row.user.command ?? '',
          }),
        );

        for (const lap of row.laps ?? []) {
          await lapsRepo.save(
            lapsRepo.create({
              arrivalResultId: result.id,
              lapNumber: lap.lap_number,
              lapTimeMs: lap.lap_time_ms,
              timestampMs: lap.timestamp_ms,
              positionOnLap: lap.position_on_lap ?? 0,
              isManual: Boolean(lap.is_manual),
            }),
          );
        }
      }
    });

    const saved = await this.findWithRelations(dto.sync_id);
    if (!saved) {
      throw new NotFoundException('Arrival not found after save');
    }

    const payload = SyncArrivalsPresenter.present(saved);
    if (existing) {
      this.networkGateway.broadcastArrivalUpdated(payload);
    } else {
      this.networkGateway.broadcastArrivalCreated(payload);
    }

    if (dto.close_stream) {
      await this.raceResultsService.closeStream();
    }

    return saved;
  }

  async removeBySyncId(syncId: string, dto?: DeleteSyncArrivalDto) {
    const existing = await this.arrivalsRepository.findOne({
      where: { syncId },
    });

    if (!existing) {
      const now = Date.now();
      return {
        syncId,
        raceSyncId: '',
        parentSyncId: null,
        name: '',
        finished: false,
        roundMinTime: 0,
        time: '',
        arrivalGrades: '[]',
        arrivalTypeSlug: 'regular',
        finishedAtMs: null,
        createdBy: dto?.created_by?.trim() || '',
        version: 0,
        createdAtMs: now,
        updatedAtMs: now,
        deletedAtMs: now,
        participantSyncIds: '[]',
        results: [],
      } as SyncArrivalEntity;
    }

    if (existing.deletedAtMs != null) {
      return existing;
    }

    const now = Date.now();
    existing.deletedAtMs = now;
    existing.updatedAtMs = now;
    if (dto?.created_by?.trim()) {
      existing.createdBy = dto.created_by.trim();
    }

    const saved = await this.arrivalsRepository.save(existing);
    this.networkGateway.broadcastArrivalDeleted(SyncArrivalsPresenter.present(saved));
    return saved;
  }

  async findBySyncId(syncId: string) {
    const arrival = await this.findWithRelations(syncId);
    if (!arrival || arrival.deletedAtMs != null) {
      throw new NotFoundException('Arrival not found');
    }
    return arrival;
  }

  async findSince(sinceMs?: number, raceSyncId?: string) {
    const qb = this.arrivalsRepository
      .createQueryBuilder('arrival')
      .leftJoinAndSelect('arrival.results', 'results')
      .leftJoinAndSelect('results.laps', 'laps')
      .orderBy('arrival.updated_at_ms', 'ASC')
      .addOrderBy('results.place', 'ASC')
      .addOrderBy('laps.lap_number', 'ASC');

    if (sinceMs != null) {
      qb.where('arrival.updated_at_ms > :sinceMs', { sinceMs });
    }

    if (raceSyncId) {
      qb.andWhere('arrival.race_sync_id = :raceSyncId', { raceSyncId });
    }

    return qb.getMany();
  }

  private async findWithRelations(syncId: string) {
    return this.arrivalsRepository.findOne({
      where: { syncId },
      relations: { results: { laps: true } },
      order: {
        results: { place: 'ASC', laps: { lapNumber: 'ASC' } },
      },
    });
  }

  private async assertRaceExists(raceSyncId: string) {
    const race = await this.racesRepository.findOne({
      where: { syncId: raceSyncId },
    });
    if (!race || race.deletedAtMs != null) {
      throw new BadRequestException('Race sync_id not found');
    }
  }

  private assertValidDto(dto: UpsertSyncArrivalDto) {
    if (!dto.sync_id?.trim()) {
      throw new BadRequestException('sync_id is required');
    }
    if (!dto.race_sync_id?.trim()) {
      throw new BadRequestException('race_sync_id is required');
    }
    if (!dto.name?.trim()) {
      throw new BadRequestException('name is required');
    }
    if (!dto.created_by?.trim()) {
      throw new BadRequestException('created_by is required');
    }
    if (!Array.isArray(dto.results)) {
      throw new BadRequestException('results must be an array');
    }
  }
}
