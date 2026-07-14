import { io } from 'socket.io-client';

const url = process.argv[2] ?? 'http://localhost:3000';

const socket = io(url, { transports: ['websocket', 'polling'] });

socket.on('connect', () => {
  console.log('connect:', socket.id);
  socket.emit('ping', { hello: 'world' });
  socket.emit('broadcast', { text: 'test from cli' });
});

socket.on('connected', (data) => console.log('connected:', data));
socket.on('pong', (data) => console.log('pong:', data));
socket.on('message', (data) => console.log('message:', data));
socket.on('connect_error', (err) => console.error('connect_error:', err.message));

setTimeout(() => {
  socket.disconnect();
  process.exit(0);
}, 2000);
