import { Module } from '@nestjs/common';
import { RaceResultsCacheModule } from '../race-results/race-results-cache.module';
import { NetworkGateway } from './network.gateway';

@Module({
  imports: [RaceResultsCacheModule],
  providers: [NetworkGateway],
  exports: [NetworkGateway],
})
export class NetworkModule {}
