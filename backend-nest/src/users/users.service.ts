import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import type { UserDto } from './user.dto';
import { User, UserDocument } from './user.schema';

export function toUserDto(user: UserDocument): UserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    initials: user.initials,
  };
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(userId: string): Promise<UserDto | null> {
    const user = await this.userModel.findById(userId).exec();
    return user ? toUserDto(user) : null;
  }

  async listExcept(userId: string): Promise<UserDto[]> {
    const users = await this.userModel
      .find({ _id: { $ne: userId } })
      .sort({ name: 1 })
      .exec();
    return users.map(toUserDto);
  }
}
