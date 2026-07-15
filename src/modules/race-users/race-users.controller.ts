import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiSecretGuard } from '../../common/guards/api-secret.guard';
import { apiSuccess } from '../../common/http/api-response';
import { DeleteRaceUserDto } from './dto/delete-race-user.dto';
import { UpsertRaceUserDto } from './dto/upsert-race-user.dto';
import { RaceUsersPresenter } from './race-users.presenter';
import { RaceUsersService } from './race-users.service';

@Controller('api/race-users')
@UseGuards(ApiSecretGuard)
export class RaceUsersController {
  constructor(private readonly raceUsersService: RaceUsersService) {}

  @Post()
  async upsert(@Body() payload: UpsertRaceUserDto) {
    const user = await this.raceUsersService.upsert(payload);

    return apiSuccess('Race user has been synced.', 200, RaceUsersPresenter.present(user));
  }

  @Get()
  async list(
    @Query('since') since?: string,
    @Query('race_sync_id') raceSyncId?: string,
  ) {
    const parsedSince =
      since !== undefined && since !== '' ? Number(since) : undefined;
    const users = await this.raceUsersService.findSince(
      Number.isFinite(parsedSince) ? parsedSince : undefined,
      raceSyncId,
    );

    return apiSuccess(
      'Race users have been fetched.',
      200,
      users.map((user) => RaceUsersPresenter.present(user)),
    );
  }

  @Get(':sync_id')
  async getOne(@Param('sync_id') syncId: string) {
    const user = await this.raceUsersService.findBySyncId(syncId);

    return apiSuccess('Race user has been fetched.', 200, RaceUsersPresenter.present(user));
  }

  @Delete(':sync_id')
  async remove(
    @Param('sync_id') syncId: string,
    @Body() body?: DeleteRaceUserDto,
  ) {
    const user = await this.raceUsersService.removeBySyncId(syncId, body);

    return apiSuccess(
      'Race user has been deleted.',
      200,
      RaceUsersPresenter.present(user),
    );
  }
}
