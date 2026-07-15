import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { FinalResultsModule } from './modules/final-results/final-results.module';
import { NetworkModule } from './modules/network/network.module';
import { RaceResultsModule } from './modules/race-results/race-results.module';
import { RaceUsersModule } from './modules/race-users/race-users.module';
import { RacesModule } from './modules/races/races.module';
import { StatusModule } from './modules/status/status.module';

@Module({
  imports: [
    DatabaseModule,
    NetworkModule,
    RaceResultsModule,
    FinalResultsModule,
    RacesModule,
    RaceUsersModule,
    StatusModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
