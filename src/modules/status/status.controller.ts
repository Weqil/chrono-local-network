import { Controller, Get } from '@nestjs/common';
import {
  SERVICE_ID,
  SERVICE_NAME,
  SERVICE_VERSION,
} from './status.constants';

@Controller('api')
export class StatusController {
  private readonly startedAt = Date.now();

  @Get('status')
  getStatus() {
    return {
      status: 'ok',
      service: SERVICE_ID,
      name: SERVICE_NAME,
      version: SERVICE_VERSION,
      uptimeSec: Math.floor((Date.now() - this.startedAt) / 1000),
    };
  }
}
