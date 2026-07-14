import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NetworkGateway } from '../network/network.gateway';
import { DeleteRaceDto } from './dto/delete-race.dto';
import { UpsertRaceDto } from './dto/upsert-race.dto';
import { RaceEntity } from './entities/race.entity';
import { RacesPresenter } from './races.presenter';

@Injectable()
export class RacesService {
  constructor(
    @InjectRepository(RaceEntity)
    private readonly racesRepository: Repository<RaceEntity>,
    private readonly networkGateway: NetworkGateway,
  ) {}

  async upsert(dto: UpsertRaceDto) {
    this.assertValidDto(dto);

    const existing = await this.racesRepository.findOne({
      where: { syncId: dto.sync_id },
    });

    const now = Date.now();

    if (existing) {
      if (existing.deletedAtMs != null) {
        throw new ConflictException({
          message: 'Race has been deleted',
          current: RacesPresenter.present(existing),
        });
      }

      if (dto.version != null && dto.version < existing.version) {
        throw new ConflictException({
          message: 'Stale race version',
          current: RacesPresenter.present(existing),
        });
      }

      existing.name = dto.name.trim();
      existing.grades = dto.grades;
      existing.serverRaceId = dto.server_race_id ?? existing.serverRaceId;
      existing.version = existing.version + 1;
      existing.updatedAtMs = dto.updated_at_ms ?? now;

      const saved = await this.racesRepository.save(existing);
      this.networkGateway.broadcastRaceUpdated(RacesPresenter.present(saved));
      return saved;
    }

    const race = this.racesRepository.create({
      syncId: dto.sync_id,
      name: dto.name.trim(),
      grades: dto.grades,
      serverRaceId: dto.server_race_id ?? null,
      createdBy: dto.created_by,
      version: 1,
      createdAtMs: now,
      updatedAtMs: dto.updated_at_ms ?? now,
      deletedAtMs: null,
    });

    const saved = await this.racesRepository.save(race);
    this.networkGateway.broadcastRaceCreated(RacesPresenter.present(saved));
    return saved;
  }

  async removeBySyncId(syncId: string, dto?: DeleteRaceDto): Promise<RaceEntity> {
    const existing = await this.racesRepository.findOne({
      where: { syncId },
    });

    if (!existing) {
      const now = Date.now();
      return {
        syncId,
        name: '',
        grades: '{"grades":[]}',
        serverRaceId: null,
        createdBy: dto?.created_by?.trim() || '',
        version: 0,
        createdAtMs: now,
        updatedAtMs: now,
        deletedAtMs: now,
      };
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

    const saved = await this.racesRepository.save(existing);
    this.networkGateway.broadcastRaceDeleted(RacesPresenter.present(saved));
    return saved;
  }

  async findBySyncId(syncId: string) {
    const race = await this.racesRepository.findOne({
      where: { syncId: syncId },
    });

    if (!race || race.deletedAtMs != null) {
      throw new NotFoundException('Race not found');
    }

    return race;
  }

  async findSince(sinceMs?: number) {
    if (sinceMs == null) {
      return this.racesRepository.find({
        order: { updatedAtMs: 'ASC' },
      });
    }

    return this.racesRepository
      .createQueryBuilder('race')
      .where('race.updated_at_ms > :sinceMs', { sinceMs })
      .orderBy('race.updated_at_ms', 'ASC')
      .getMany();
  }

  private assertValidDto(dto: UpsertRaceDto) {
    if (!dto.sync_id?.trim()) {
      throw new BadRequestException('sync_id is required');
    }

    if (!dto.name?.trim()) {
      throw new BadRequestException('name is required');
    }

    if (!dto.created_by?.trim()) {
      throw new BadRequestException('created_by is required');
    }

    if (!dto.grades?.trim()) {
      throw new BadRequestException('grades is required');
    }

    this.assertValidGrades(dto.grades);
  }

  private assertValidGrades(grades: string) {
    try {
      const parsed = JSON.parse(grades) as { grades?: unknown };

      if (!Array.isArray(parsed?.grades)) {
        throw new Error();
      }
    } catch {
      throw new BadRequestException('Invalid grades format');
    }
  }
}
