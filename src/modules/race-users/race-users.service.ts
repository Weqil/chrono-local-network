import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NetworkGateway } from '../network/network.gateway';
import { RaceEntity } from '../races/entities/race.entity';
import { DeleteRaceUserDto } from './dto/delete-race-user.dto';
import { UpsertRaceUserDto } from './dto/upsert-race-user.dto';
import { RaceUserEntity } from './entities/race-user.entity';
import { RaceUsersPresenter } from './race-users.presenter';

@Injectable()
export class RaceUsersService {
  constructor(
    @InjectRepository(RaceUserEntity)
    private readonly raceUsersRepository: Repository<RaceUserEntity>,
    @InjectRepository(RaceEntity)
    private readonly racesRepository: Repository<RaceEntity>,
    private readonly networkGateway: NetworkGateway,
  ) {}

  async upsert(dto: UpsertRaceUserDto) {
    this.assertValidDto(dto);
    await this.assertRaceExists(dto.race_sync_id);

    const existing = await this.raceUsersRepository.findOne({
      where: { syncId: dto.sync_id },
    });

    const now = Date.now();

    if (existing) {
      if (existing.deletedAtMs != null) {
        throw new ConflictException({
          message: 'Race user has been deleted',
          current: RaceUsersPresenter.present(existing),
        });
      }

      if (dto.version != null && dto.version < existing.version) {
        throw new ConflictException({
          message: 'Stale race user version',
          current: RaceUsersPresenter.present(existing),
        });
      }

      existing.raceSyncId = dto.race_sync_id;
      existing.name = dto.name.trim();
      existing.surname = dto.surname.trim();
      existing.patronymic = dto.patronymic?.trim() || null;
      existing.startNumber = dto.start_number;
      existing.grade = dto.grade.trim();
      existing.command = dto.command?.trim() || null;
      existing.tags = dto.tags;
      existing.createdBy = dto.created_by;
      existing.version = existing.version + 1;
      existing.updatedAtMs = dto.updated_at_ms ?? now;

      const saved = await this.raceUsersRepository.save(existing);
      this.networkGateway.broadcastRaceUserUpdated(RaceUsersPresenter.present(saved));
      return saved;
    }

    const entity = this.raceUsersRepository.create({
      syncId: dto.sync_id,
      raceSyncId: dto.race_sync_id,
      name: dto.name.trim(),
      surname: dto.surname.trim(),
      patronymic: dto.patronymic?.trim() || null,
      startNumber: dto.start_number,
      grade: dto.grade.trim(),
      command: dto.command?.trim() || null,
      tags: dto.tags,
      createdBy: dto.created_by,
      version: 1,
      createdAtMs: now,
      updatedAtMs: dto.updated_at_ms ?? now,
      deletedAtMs: null,
    });

    const saved = await this.raceUsersRepository.save(entity);
    this.networkGateway.broadcastRaceUserCreated(RaceUsersPresenter.present(saved));
    return saved;
  }

  async removeBySyncId(syncId: string, dto?: DeleteRaceUserDto): Promise<RaceUserEntity> {
    const existing = await this.raceUsersRepository.findOne({
      where: { syncId },
    });

    if (!existing) {
      const now = Date.now();
      return {
        syncId,
        raceSyncId: '',
        name: '',
        surname: '',
        patronymic: null,
        startNumber: 0,
        grade: '',
        command: null,
        tags: '[]',
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

    const saved = await this.raceUsersRepository.save(existing);
    this.networkGateway.broadcastRaceUserDeleted(RaceUsersPresenter.present(saved));
    return saved;
  }

  async removeAllByRaceSyncId(raceSyncId: string, deletedBy?: string): Promise<void> {
    const users = await this.raceUsersRepository.find({
      where: { raceSyncId },
    });

    const now = Date.now();
    for (const user of users) {
      if (user.deletedAtMs != null) {
        continue;
      }

      user.deletedAtMs = now;
      user.updatedAtMs = now;
      if (deletedBy?.trim()) {
        user.createdBy = deletedBy.trim();
      }

      const saved = await this.raceUsersRepository.save(user);
      this.networkGateway.broadcastRaceUserDeleted(RaceUsersPresenter.present(saved));
    }
  }

  async findBySyncId(syncId: string) {
    const user = await this.raceUsersRepository.findOne({
      where: { syncId },
    });

    if (!user || user.deletedAtMs != null) {
      throw new NotFoundException('Race user not found');
    }

    return user;
  }

  async findSince(sinceMs?: number, raceSyncId?: string) {
    const qb = this.raceUsersRepository.createQueryBuilder('race_user');

    if (sinceMs != null) {
      qb.andWhere('race_user.updated_at_ms > :sinceMs', { sinceMs });
    }

    if (raceSyncId?.trim()) {
      qb.andWhere('race_user.race_sync_id = :raceSyncId', { raceSyncId });
    }

    return qb.orderBy('race_user.updated_at_ms', 'ASC').getMany();
  }

  private async assertRaceExists(raceSyncId: string) {
    const race = await this.racesRepository.findOne({
      where: { syncId: raceSyncId },
    });

    if (!race || race.deletedAtMs != null) {
      throw new BadRequestException('Race not found or has been deleted');
    }
  }

  private assertValidDto(dto: UpsertRaceUserDto) {
    if (!dto.sync_id?.trim()) {
      throw new BadRequestException('sync_id is required');
    }

    if (!dto.race_sync_id?.trim()) {
      throw new BadRequestException('race_sync_id is required');
    }

    if (!dto.name?.trim()) {
      throw new BadRequestException('name is required');
    }

    if (!dto.surname?.trim()) {
      throw new BadRequestException('surname is required');
    }

    if (!dto.created_by?.trim()) {
      throw new BadRequestException('created_by is required');
    }

    if (!dto.grade?.trim()) {
      throw new BadRequestException('grade is required');
    }

    if (!Number.isFinite(Number(dto.start_number))) {
      throw new BadRequestException('start_number is required');
    }

    if (!dto.tags?.trim()) {
      throw new BadRequestException('tags is required');
    }

    this.assertValidTags(dto.tags);
  }

  private assertValidTags(tags: string) {
    try {
      const parsed = JSON.parse(tags);
      if (!Array.isArray(parsed)) {
        throw new Error();
      }
    } catch {
      throw new BadRequestException('Invalid tags format');
    }
  }
}
