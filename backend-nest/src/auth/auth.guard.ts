import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';
import { AuthenticatedRequest } from './authenticated-request';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Not authenticated');
    }

    let userId: string;
    try {
      ({ sub: userId } = await this.jwtService.verifyAsync<{ sub: string }>(
        token,
      ));
    } catch {
      throw new UnauthorizedException('Not authenticated');
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Not authenticated');
    }
    request.user = user;
    return true;
  }
}
