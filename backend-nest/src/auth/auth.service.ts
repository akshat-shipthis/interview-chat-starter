import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { toUserDto, UsersService } from '../users/users.service';
import { LoginResponseDto } from './dto/login.dto';
import { verifyPassword } from './password';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Promise<LoginResponseDto> {
    const user = await this.usersService.findByEmail(email.toLowerCase());
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      throw new UnauthorizedException('Incorrect email or password');
    }
    return {
      access_token: await this.jwtService.signAsync({ sub: user.id }),
      token_type: 'bearer',
      user: toUserDto(user),
    };
  }
}
