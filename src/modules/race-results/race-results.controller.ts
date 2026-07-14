import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiSecretGuard } from '../../common/guards/api-secret.guard';
import { LiveTimingDataDto } from './dto/live-timing-data.dto';
import { LiveTimingData } from './interfaces/live-timing-data.interface';
import { RaceResultsService } from './race-results.service';

@Controller('api/hrono')
@UseGuards(ApiSecretGuard)
export class RaceResultsController {
  constructor(private readonly raceResultsService: RaceResultsService) {}

  @Post('results')
  async receiveResults(@Body() payload: LiveTimingDataDto) {
    await this.raceResultsService.receive(payload as LiveTimingData);

    return {
      status: 'success',
      message: 'Results received',
    };
  }

  @Post('stream/close')
  async closeStream() {
    const streamStatus = await this.raceResultsService.closeStream();

    return {
      status: 'success',
      message: 'Stream closed',
      ...streamStatus,
    };
  }

  @Get('stream/status')
  getStreamStatus() {
    return {
      status: 'success',
      ...this.raceResultsService.getStreamStatus(),
    };
  }

  @Get('results')
  getResults() {
    const cached = this.raceResultsService.getLast();
    const payload = cached?.data ?? null;
    const streamStatus = this.raceResultsService.getStreamStatus();

    return {
      status: 'success',
      race_id: payload?.arrival_meta?.race_id ?? null,
      arrival_name: payload?.arrival_meta?.arrival_name ?? null,
      arrival_type_id: payload?.arrival_meta?.arrival_type_id ?? null,
      is_stream_open: streamStatus.is_stream_open,
      data: payload,
      updated_at: cached?.updated_at ?? null,
    };
  }
}
