import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NetworkModule } from '../network/network.module';
import { RaceResultsModule } from '../race-results/race-results.module';
import { RaceEntity } from '../races/entities/race.entity';
import { SyncArrivalEntity } from './entities/sync-arrival.entity';
import { SyncArrivalResultEntity } from './entities/sync-arrival-result.entity';
import { SyncArrivalResultLapEntity } from './entities/sync-arrival-result-lap.entity';
import { SyncArrivalsController } from './sync-arrivals.controller';
import { SyncArrivalsService } from './sync-arrivals.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SyncArrivalEntity,
      SyncArrivalResultEntity,
      SyncArrivalResultLapEntity,
      RaceEntity,
    ]),
    NetworkModule,
    forwardRef(() => RaceResultsModule),
  ],
  controllers: [SyncArrivalsController],
  providers: [SyncArrivalsService],
  exports: [SyncArrivalsService],
})
export class SyncArrivalsModule {}
