import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArrivalEntity } from '../modules/final-results/entities/arrival.entity';
import { ArrivalResultEntity } from '../modules/final-results/entities/arrival-result.entity';
import { ArrivalResultLapEntity } from '../modules/final-results/entities/arrival-result-lap.entity';
import { LiveResultSnapshotEntity } from '../modules/race-results/entities/live-result-snapshot.entity';

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
      ],
      synchronize: true,
    }),
  ],
})
export class DatabaseModule {}
