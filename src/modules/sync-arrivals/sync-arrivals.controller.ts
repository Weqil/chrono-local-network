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
import { DeleteSyncArrivalDto, UpsertSyncArrivalDto } from './dto/upsert-sync-arrival.dto';
import { SyncArrivalsPresenter } from './sync-arrivals.presenter';
import { SyncArrivalsService } from './sync-arrivals.service';

@Controller('api/sync-arrivals')
@UseGuards(ApiSecretGuard)
export class SyncArrivalsController {
  constructor(private readonly syncArrivalsService: SyncArrivalsService) {}

  @Post()
  async upsert(@Body() payload: UpsertSyncArrivalDto) {
    const arrival = await this.syncArrivalsService.upsert(payload);
    return apiSuccess('Arrival has been synced.', 200, SyncArrivalsPresenter.present(arrival));
  }

  @Get()
  async list(
    @Query('since') since?: string,
    @Query('race_sync_id') raceSyncId?: string,
  ) {
    const parsedSince =
      since !== undefined && since !== '' ? Number(since) : undefined;
    const arrivals = await this.syncArrivalsService.findSince(
      Number.isFinite(parsedSince) ? parsedSince : undefined,
      raceSyncId,
    );

    return apiSuccess(
      'Arrivals have been fetched.',
      200,
      arrivals.map((a) => SyncArrivalsPresenter.present(a)),
    );
  }

  @Get(':sync_id')
  async getOne(@Param('sync_id') syncId: string) {
    const arrival = await this.syncArrivalsService.findBySyncId(syncId);
    return apiSuccess('Arrival has been fetched.', 200, SyncArrivalsPresenter.present(arrival));
  }

  @Delete(':sync_id')
  async remove(
    @Param('sync_id') syncId: string,
    @Body() body?: DeleteSyncArrivalDto,
  ) {
    const arrival = await this.syncArrivalsService.removeBySyncId(syncId, body);
    return apiSuccess('Arrival has been deleted.', 200, SyncArrivalsPresenter.present(arrival));
  }
}
