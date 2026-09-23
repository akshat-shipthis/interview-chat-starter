import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import type { UserDto } from '../users/user.dto';
import { AuthenticatedRequest } from './authenticated-request';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): UserDto =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().user,
);
