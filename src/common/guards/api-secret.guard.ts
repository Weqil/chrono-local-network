import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ApiSecretGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const secret = process.env.API_SECRET;

    if (!secret) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const provided = request.header('x-api-secret');

    if (provided !== secret) {
      throw new ForbiddenException();
    }

    return true;
  }
}
