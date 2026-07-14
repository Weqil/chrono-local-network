import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { RaceResultsCacheService } from '../race-results/race-results-cache.service';
import { RaceResultsService } from '../race-results/race-results.service';
import { SaveFinalResultsDto } from './dto/save-final-results.dto';
import { ArrivalEntity } from './entities/arrival.entity';
import { ArrivalResultEntity } from './entities/arrival-result.entity';
import { ArrivalResultLapEntity } from './entities/arrival-result-lap.entity';
import { FinalResultsPresenter } from './final-results.presenter';

@Injectable()
export class FinalResultsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(ArrivalEntity)
    private readonly arrivalsRepository: Repository<ArrivalEntity>,
    private readonly raceResultsService: RaceResultsService,
    private readonly raceResultsCache: RaceResultsCacheService,
  ) {}

  async save(arrivalId: number, payload: SaveFinalResultsDto) {
    this.assertValidPayload(arrivalId, payload);

    const cachedMeta = this.raceResultsCache.get()?.data.arrival_meta;

    await this.dataSource.transaction(async (manager) => {
      const arrivalsRepo = manager.getRepository(ArrivalEntity);
      const resultsRepo = manager.getRepository(ArrivalResultEntity);
      const lapsRepo = manager.getRepository(ArrivalResultLapEntity);

      let arrival = await arrivalsRepo.findOne({ where: { id: arrivalId } });

      if (!arrival) {
        arrival = arrivalsRepo.create({
          id: arrivalId,
          serverRaceId: payload.server_race_id,
          localArrivalId: payload.local_arrival_id,
          finishedAtMs: payload.finished_at_ms,
          name: cachedMeta?.arrival_name ?? '',
          time: '',
          arrivalTypeId: cachedMeta?.arrival_type_id ?? null,
          arrivalTypeName: null,
          arrivalTypeSlug: cachedMeta?.arrival_type_slug ?? null,
        });
      } else if (arrival.serverRaceId !== payload.server_race_id) {
        throw new UnprocessableEntityException('Race id mismatch');
      } else {
        arrival.localArrivalId = payload.local_arrival_id;
        arrival.finishedAtMs = payload.finished_at_ms;
        if (!arrival.name && cachedMeta?.arrival_name) {
          arrival.name = cachedMeta.arrival_name;
        }
        if (arrival.arrivalTypeId === null && cachedMeta?.arrival_type_id) {
          arrival.arrivalTypeId = cachedMeta.arrival_type_id;
        }
        if (!arrival.arrivalTypeSlug && cachedMeta?.arrival_type_slug) {
          arrival.arrivalTypeSlug = cachedMeta.arrival_type_slug;
        }
      }

      await arrivalsRepo.save(arrival);

      const existingResults = await resultsRepo.find({
        where: { arrivalId },
        select: { id: true },
      });

      if (existingResults.length > 0) {
        const resultIds = existingResults.map((result) => result.id);
        await lapsRepo
          .createQueryBuilder()
          .delete()
          .where('arrival_result_id IN (:...resultIds)', { resultIds })
          .execute();
        await resultsRepo.delete({ arrivalId });
      }

      for (const row of payload.results) {
        const result = await resultsRepo.save(
          resultsRepo.create({
            arrivalId,
            serverRaceId: payload.server_race_id,
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

    await this.raceResultsService.closeStream();

    return { id: String(arrivalId) };
  }

  async getByArrivalId(arrivalId: number) {
    const arrival = await this.findArrivalWithRelations(arrivalId);

    if (!arrival) {
      throw new NotFoundException('Arrival not found');
    }

    const data = FinalResultsPresenter.presentArrival(arrival);

    if (!data) {
      throw new NotFoundException('Final results not found');
    }

    return data;
  }

  async getByRaceId(raceId: number, arrivalTypeId?: number) {
    const arrivals = await this.arrivalsRepository.find({
      where: {
        serverRaceId: raceId,
        ...(arrivalTypeId ? { arrivalTypeId } : {}),
      },
      relations: {
        results: { laps: true },
      },
      order: {
        finishedAtMs: 'ASC',
        id: 'ASC',
        results: {
          place: 'ASC',
          laps: { lapNumber: 'ASC' },
        },
      },
    });

    const withResults = arrivals.filter(
      (arrival) =>
        arrival.finishedAtMs !== null && (arrival.results?.length ?? 0) > 0,
    );

    return FinalResultsPresenter.presentRace(raceId, withResults);
  }

  private async findArrivalWithRelations(arrivalId: number) {
    return this.arrivalsRepository.findOne({
      where: { id: arrivalId },
      relations: {
        results: { laps: true },
      },
      order: {
        results: {
          place: 'ASC',
          laps: { lapNumber: 'ASC' },
        },
      },
    });
  }

  private assertValidPayload(arrivalId: number, payload: SaveFinalResultsDto) {
    if (payload.server_arrival_id !== arrivalId) {
      throw new UnprocessableEntityException('Server arrival id mismatch');
    }

    if (!Array.isArray(payload.results) || payload.results.length === 0) {
      throw new BadRequestException('Results are required');
    }

    for (const row of payload.results) {
      if (!row.user?.id || !row.user?.name) {
        throw new BadRequestException('Invalid participant user');
      }
    }
  }
}
