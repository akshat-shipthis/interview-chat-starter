import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';

import type { UserDto } from '../users/user.dto';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import { LoginDto } from './dto/login.dto';
import type { LoginResponseDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() body: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(body.email, body.password);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@CurrentUser() currentUser: UserDto): UserDto {
    return currentUser;
  }
}
