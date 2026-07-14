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
import { DeleteRaceDto } from './dto/delete-race.dto';
import { UpsertRaceDto } from './dto/upsert-race.dto';
import { RacesPresenter } from './races.presenter';
import { RacesService } from './races.service';

@Controller('api/races')
@UseGuards(ApiSecretGuard)
export class RacesController {
  constructor(private readonly racesService: RacesService) {}

  @Post()
  async upsert(@Body() payload: UpsertRaceDto) {
    const race = await this.racesService.upsert(payload);

    return apiSuccess('Race has been synced.', 200, RacesPresenter.present(race));
  }

  @Get()
  async list(@Query('since') since?: string) {
    const parsedSince =
      since !== undefined && since !== '' ? Number(since) : undefined;
    const races = await this.racesService.findSince(
      Number.isFinite(parsedSince) ? parsedSince : undefined,
    );

    return apiSuccess(
      'Races have been fetched.',
      200,
      races.map((race) => RacesPresenter.present(race)),
    );
  }

  @Get(':sync_id')
  async getOne(@Param('sync_id') syncId: string) {
    const race = await this.racesService.findBySyncId(syncId);

    return apiSuccess('Race has been fetched.', 200, RacesPresenter.present(race));
  }

  @Delete(':sync_id')
  async remove(
    @Param('sync_id') syncId: string,
    @Body() body?: DeleteRaceDto,
  ) {
    const race = await this.racesService.removeBySyncId(syncId, body);

    return apiSuccess(
      'Race has been deleted.',
      200,
      RacesPresenter.present(race),
    );
  }
}
