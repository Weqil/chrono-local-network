import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiSecretGuard } from '../../common/guards/api-secret.guard';
import { apiSuccess } from '../../common/http/api-response';
import { SaveFinalResultsDto } from './dto/save-final-results.dto';
import { FinalResultsService } from './final-results.service';

@Controller('api')
@UseGuards(ApiSecretGuard)
export class FinalResultsController {
  constructor(private readonly finalResultsService: FinalResultsService) {}

  @Post('arrivals/:id/final-results')
  async save(
    @Param('id', ParseIntPipe) arrivalId: number,
    @Body() payload: SaveFinalResultsDto,
  ) {
    const data = await this.finalResultsService.save(arrivalId, payload);

    return apiSuccess('Final arrival results have been saved.', 200, data);
  }

  @Get('arrivals/:id/final-results')
  async getByArrival(@Param('id', ParseIntPipe) arrivalId: number) {
    const data = await this.finalResultsService.getByArrivalId(arrivalId);

    return apiSuccess('Final arrival results have been fetched.', 200, data);
  }

  @Get('races/:id/final-results')
  async getByRace(
    @Param('id', ParseIntPipe) raceId: number,
    @Query('arrival_type_id') arrivalTypeId?: string,
  ) {
    const parsedTypeId =
      arrivalTypeId !== undefined && arrivalTypeId !== ''
        ? Number(arrivalTypeId)
        : undefined;

    const data = await this.finalResultsService.getByRaceId(
      raceId,
      Number.isFinite(parsedTypeId) ? parsedTypeId : undefined,
    );

    return apiSuccess('Race final results have been fetched.', 200, data);
  }
}
