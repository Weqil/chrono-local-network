import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RaceResultsModule } from '../race-results/race-results.module';
import { ArrivalEntity } from './entities/arrival.entity';
import { ArrivalResultEntity } from './entities/arrival-result.entity';
import { ArrivalResultLapEntity } from './entities/arrival-result-lap.entity';
import { FinalResultsController } from './final-results.controller';
import { FinalResultsService } from './final-results.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ArrivalEntity,
      ArrivalResultEntity,
      ArrivalResultLapEntity,
    ]),
    RaceResultsModule,
  ],
  controllers: [FinalResultsController],
  providers: [FinalResultsService],
})
export class FinalResultsModule {}
