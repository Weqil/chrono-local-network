import { io } from 'socket.io-client';

const url = process.argv[2] ?? 'http://localhost:3000';
const role = process.argv[3] ?? 'tv';

const samplePayload = {
  arrival_meta: {
    race_id: 42,
    arrival_name: 'Финал MX1',
    arrival_type_id: 1,
    last_lap_number: 3,
    stream_opened_at: Date.now(),
  },
  participants: [
    {
      id: 1,
      lapCount: 3,
      lastLapTimestampMs: 92500,
      totalRaceTimeMs: 275400,
      position: 1,
      displayTimeMs: 275400,
      laps_behind: 0,
      bestLapTimeMs: 90100,
      lastLapDeltaSec: 0.4,
      participantData: {
        id: 1,
        name: 'Иван',
        surname: 'Иванов',
        patronymic: 'Иванович',
        start_number: 7,
      },
    },
  ],
};

const socket = io(url, { transports: ['websocket', 'polling'] });

socket.on('connect', () => console.log('connect:', socket.id));
socket.on('connected', (data) => console.log('connected:', data));
socket.on('race.stream.status.updated', (data) =>
  console.log('race.stream.status.updated:', data),
);
socket.on('hrono.race.results.updated', (data) =>
  console.log('hrono.race.results.updated:', JSON.stringify(data, null, 2)),
);
socket.on('connect_error', (err) => console.error('connect_error:', err.message));

if (role === 'producer') {
  setTimeout(async () => {
    const postResponse = await fetch(`${url}/api/hrono/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(samplePayload),
    });
    console.log('POST results:', postResponse.status, await postResponse.json());

    await new Promise((resolve) => setTimeout(resolve, 500));

    const closeResponse = await fetch(`${url}/api/hrono/stream/close`, {
      method: 'POST',
    });
    console.log('POST close:', closeResponse.status, await closeResponse.json());

    setTimeout(() => process.exit(0), 500);
  }, 500);
}
