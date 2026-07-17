import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArrivalEntity } from '../modules/final-results/entities/arrival.entity';
import { ArrivalResultEntity } from '../modules/final-results/entities/arrival-result.entity';
import { ArrivalResultLapEntity } from '../modules/final-results/entities/arrival-result-lap.entity';
import { LiveResultSnapshotEntity } from '../modules/race-results/entities/live-result-snapshot.entity';
import { RaceEntity } from '../modules/races/entities/race.entity';
import { RaceUserEntity } from '../modules/race-users/entities/race-user.entity';
import { SyncArrivalEntity } from '../modules/sync-arrivals/entities/sync-arrival.entity';
import { SyncArrivalResultEntity } from '../modules/sync-arrivals/entities/sync-arrival-result.entity';
import { SyncArrivalResultLapEntity } from '../modules/sync-arrivals/entities/sync-arrival-result-lap.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.DATABASE_PATH ?? './data/chrono.sqlite',
      entities: [
        ArrivalEntity,
        ArrivalResultEntity,
        ArrivalResultLapEntity,
        LiveResultSnapshotEntity,
        RaceEntity,
        RaceUserEntity,
        SyncArrivalEntity,
        SyncArrivalResultEntity,
        SyncArrivalResultLapEntity,
      ],
      synchronize: true,
    }),
  ],
})
export class DatabaseModule {}
