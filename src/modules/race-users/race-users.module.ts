import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NetworkModule } from '../network/network.module';
import { RaceEntity } from '../races/entities/race.entity';
import { RaceUserEntity } from './entities/race-user.entity';
import { RaceUsersController } from './race-users.controller';
import { RaceUsersService } from './race-users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RaceUserEntity, RaceEntity]),
    NetworkModule,
  ],
  controllers: [RaceUsersController],
  providers: [RaceUsersService],
  exports: [RaceUsersService],
})
export class RaceUsersModule {}
