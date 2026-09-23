import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

import type { UserDto } from '../../users/user.dto';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export interface LoginResponseDto {
  access_token: string;
  token_type: string;
  user: UserDto;
}
