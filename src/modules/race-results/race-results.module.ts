import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NetworkModule } from '../network/network.module';
import { LiveResultSnapshotEntity } from './entities/live-result-snapshot.entity';
import { LiveResultsStore } from './live-results.store';
import { RaceResultsCacheModule } from './race-results-cache.module';
import { RaceResultsController } from './race-results.controller';
import { RaceResultsService } from './race-results.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([LiveResultSnapshotEntity]),
    RaceResultsCacheModule,
    NetworkModule,
  ],
  controllers: [RaceResultsController],
  providers: [RaceResultsService, LiveResultsStore],
  exports: [RaceResultsService, RaceResultsCacheModule],
})
export class RaceResultsModule {}
