import { Request } from 'express';

import type { UserDto } from '../users/user.dto';

export interface AuthenticatedRequest extends Request {
  user: UserDto;
}
