import 'dotenv/config';
import { mkdirSync, existsSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { networkInterfaces } from 'os';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

function getLanAddresses(): string[] {
  const interfaces = networkInterfaces();

  return Object.values(interfaces)
    .flatMap((addresses) => addresses ?? [])
    .filter((address) => address.family === 'IPv4' && !address.internal)
    .map((address) => address.address)
    .filter((ip) => /^(192\.168|10|172\.(1[6-9]|2\d|3[01]))\./.test(ip));
}

function printBanner(port: string | number, addresses: string[]): void {
  const lines = [
    'CHRONO LOCAL NETWORK',
    '',
    `Local:    http://localhost:${port}`,
    ...addresses.map((ip) => `Network:  http://${ip}:${port}`),
  ];

  const width = Math.max(...lines.map((line) => line.length)) + 4;
  const border = '='.repeat(width);

  const banner = [
    '',
    border,
    ...lines.map((line) => `  ${line.padEnd(width - 4)}  `.slice(0, width)),
    border,
    '',
  ].join('\n');

  process.stdout.write(`${banner}\n`);
}

function writeAddressFile(port: string | number, addresses: string[]): string {
  const filePath = resolve(process.cwd(), 'server-address.txt');
  const content = [
    'CHRONO LOCAL NETWORK',
    `Updated: ${new Date().toISOString()}`,
    '',
    `Local:    http://localhost:${port}`,
    ...addresses.map((ip) => `Network:  http://${ip}:${port}`),
    '',
  ].join('\n');

  writeFileSync(filePath, content, 'utf8');

  return filePath;
}

async function bootstrap() {
  const databasePath = process.env.DATABASE_PATH ?? './data/chrono.sqlite';
  const databaseDir = dirname(databasePath);

  if (!existsSync(databaseDir)) {
    mkdirSync(databaseDir, { recursive: true });
  }

  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });

  const port = process.env.PORT ?? 3000;
  await app.listen(port, process.env.HOST ?? '0.0.0.0');

  const addresses = getLanAddresses();
  printBanner(port, addresses);

  const filePath = writeAddressFile(port, addresses);
  new Logger('Bootstrap').log(`Server address written to ${filePath}`);
}
bootstrap();
