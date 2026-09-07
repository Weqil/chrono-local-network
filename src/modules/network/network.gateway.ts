import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import {
  RACE_RESULTS_UPDATED_EVENT,
  RACE_STREAM_STATUS_UPDATED_EVENT,
} from '../race-results/constants';
import { RaceResultsCacheService } from '../race-results/race-results-cache.service';
import { LiveTimingData } from '../race-results/interfaces/live-timing-data.interface';
import { StreamStatus } from '../race-results/interfaces/stream-status.interface';
import {
  SYNC_GLOBAL_ROOM,
  SYNC_RACE_CREATED_EVENT,
  SYNC_RACE_DELETED_EVENT,
  SYNC_RACE_UPDATED_EVENT,
} from '../races/constants';
import {
  SYNC_RACE_USER_CREATED_EVENT,
  SYNC_RACE_USER_DELETED_EVENT,
  SYNC_RACE_USER_UPDATED_EVENT,
} from '../race-users/constants';
import { RaceSyncPayload } from '../races/interfaces/race-sync-payload.interface';
import { RaceUserSyncPayload } from '../race-users/interfaces/race-user-sync-payload.interface';
import {
  SYNC_ARRIVAL_CREATED_EVENT,
  SYNC_ARRIVAL_DELETED_EVENT,
  SYNC_ARRIVAL_UPDATED_EVENT,
} from '../sync-arrivals/constants';
import { SyncArrivalSyncPayload } from '../sync-arrivals/interfaces/sync-arrival-sync-payload.interface';
import { RACE_RESULTS_STREAM_ROOM } from './constants';
import {
  DepartureNotifyPayload,
  isDepartureNotifyPayload,
  NOTIFY_DEPARTURE_COMPLETED_EVENT,
  NOTIFY_DEPARTURE_STARTED_EVENT,
} from './notify.constants';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class NetworkGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NetworkGateway.name);

  constructor(private readonly raceResultsCache: RaceResultsCacheService) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    await client.join(RACE_RESULTS_STREAM_ROOM);
    await client.join(SYNC_GLOBAL_ROOM);
    this.logger.log(
      `Client ${client.id} connected and joined ${RACE_RESULTS_STREAM_ROOM}, ${SYNC_GLOBAL_ROOM}`,
    );
    client.emit('connected', {
      id: client.id,
      rooms: [RACE_RESULTS_STREAM_ROOM, SYNC_GLOBAL_ROOM],
    });

    client.emit(
      RACE_STREAM_STATUS_UPDATED_EVENT,
      this.raceResultsCache.getStreamStatus(),
    );

    const cached = this.raceResultsCache.get();
    if (cached) {
      client.emit(RACE_RESULTS_UPDATED_EVENT, cached.data);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  broadcastRaceResults(payload: LiveTimingData) {
    this.server
      .to(RACE_RESULTS_STREAM_ROOM)
      .emit(RACE_RESULTS_UPDATED_EVENT, payload);
  }

  broadcastStreamStatus(status: StreamStatus) {
    this.server
      .to(RACE_RESULTS_STREAM_ROOM)
      .emit(RACE_STREAM_STATUS_UPDATED_EVENT, status);
  }

  broadcastRaceCreated(payload: RaceSyncPayload) {
    this.server.to(SYNC_GLOBAL_ROOM).emit(SYNC_RACE_CREATED_EVENT, payload);
  }

  broadcastRaceUpdated(payload: RaceSyncPayload) {
    this.server.to(SYNC_GLOBAL_ROOM).emit(SYNC_RACE_UPDATED_EVENT, payload);
  }

  broadcastRaceDeleted(payload: RaceSyncPayload) {
    this.server.to(SYNC_GLOBAL_ROOM).emit(SYNC_RACE_DELETED_EVENT, payload);
  }

  broadcastRaceUserCreated(payload: RaceUserSyncPayload) {
    this.server.to(SYNC_GLOBAL_ROOM).emit(SYNC_RACE_USER_CREATED_EVENT, payload);
  }

  broadcastRaceUserUpdated(payload: RaceUserSyncPayload) {
    this.server.to(SYNC_GLOBAL_ROOM).emit(SYNC_RACE_USER_UPDATED_EVENT, payload);
  }

  broadcastRaceUserDeleted(payload: RaceUserSyncPayload) {
    this.server.to(SYNC_GLOBAL_ROOM).emit(SYNC_RACE_USER_DELETED_EVENT, payload);
  }

  broadcastArrivalCreated(payload: SyncArrivalSyncPayload) {
    this.server.to(SYNC_GLOBAL_ROOM).emit(SYNC_ARRIVAL_CREATED_EVENT, payload);
  }

  broadcastArrivalUpdated(payload: SyncArrivalSyncPayload) {
    this.server.to(SYNC_GLOBAL_ROOM).emit(SYNC_ARRIVAL_UPDATED_EVENT, payload);
  }

  broadcastArrivalDeleted(payload: SyncArrivalSyncPayload) {
    this.server.to(SYNC_GLOBAL_ROOM).emit(SYNC_ARRIVAL_DELETED_EVENT, payload);
  }

  @SubscribeMessage('ping')
  handlePing(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: unknown,
  ) {
    return { event: 'pong', data: { clientId: client.id, payload } };
  }

  @SubscribeMessage(NOTIFY_DEPARTURE_STARTED_EVENT)
  handleDepartureStarted(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: unknown,
  ) {
    this.relayDepartureNotify(client, NOTIFY_DEPARTURE_STARTED_EVENT, payload);
  }

  @SubscribeMessage(NOTIFY_DEPARTURE_COMPLETED_EVENT)
  handleDepartureCompleted(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: unknown,
  ) {
    this.relayDepartureNotify(client, NOTIFY_DEPARTURE_COMPLETED_EVENT, payload);
  }

  private relayDepartureNotify(
    client: Socket,
    event: string,
    payload: unknown,
  ) {
    if (!isDepartureNotifyPayload(payload)) {
      this.logger.warn(`Ignored invalid ${event} payload from ${client.id}`);
      return;
    }
    const safePayload: DepartureNotifyPayload = {
      arrival_sync_id: payload.arrival_sync_id,
      arrival_name: payload.arrival_name,
      race_sync_id: payload.race_sync_id,
      device_id: payload.device_id,
      at_ms: payload.at_ms,
    };
    // Exclude sender — actor should not see their own race-event banner.
    client.to(SYNC_GLOBAL_ROOM).emit(event, safePayload);
  }
}
