/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly databaseService: DatabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Bearer token not present!');
    }
    // 💡 Here the JWT secret key that's used for verifying the payload
    // is the key that was passed in the JwtModule
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch (err) {
      if (err instanceof Error && err.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Session expired');
      }

      throw new UnauthorizedException('Invalid token');
    }
    // 💡 We're assigning the payload to the request object here
    // so that we can access it in our route handlers

    const userExists = await this.databaseService.user.findUnique({
      where: {
        id: Number(payload.sub),
      },
    });

    // If the user was deleted, block the request instantly
    if (!userExists) {
      throw new UnauthorizedException('User account no longer exists');
    }
    request['payload'] = payload;
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type?.toLowerCase() === 'bearer' ? token : undefined;
  }
}
