import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NetworkModule } from '../network/network.module';
import { RaceEntity } from './entities/race.entity';
import { RacesController } from './races.controller';
import { RacesService } from './races.service';

@Module({
  imports: [TypeOrmModule.forFeature([RaceEntity]), NetworkModule],
  controllers: [RacesController],
  providers: [RacesService],
  exports: [RacesService],
})
export class RacesModule {}
