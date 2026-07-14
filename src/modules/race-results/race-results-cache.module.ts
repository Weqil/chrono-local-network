import { Module } from '@nestjs/common';
import { RaceResultsCacheService } from './race-results-cache.service';

@Module({
  providers: [RaceResultsCacheService],
  exports: [RaceResultsCacheService],
})
export class RaceResultsCacheModule {}
