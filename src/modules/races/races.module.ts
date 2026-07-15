import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NetworkModule } from '../network/network.module';
import { RaceUsersModule } from '../race-users/race-users.module';
import { RaceEntity } from './entities/race.entity';
import { RacesController } from './races.controller';
import { RacesService } from './races.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RaceEntity]),
    NetworkModule,
    forwardRef(() => RaceUsersModule),
  ],
  controllers: [RacesController],
  providers: [RacesService],
  exports: [RacesService],
})
export class RacesModule {}
