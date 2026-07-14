import { io } from 'socket.io-client';

const url = process.argv[2] ?? 'http://localhost:3000';

const socket = io(url, { transports: ['websocket', 'polling'] });

socket.on('connect', () => {
  console.log('connected:', socket.id);
});

socket.on('sync.race.created', (data) => {
  console.log('sync.race.created:', data);
});

socket.on('sync.race.updated', (data) => {
  console.log('sync.race.updated:', data);
});

socket.on('connect_error', (err) => {
  console.error('connect_error:', err.message);
});

process.stdin.resume();
