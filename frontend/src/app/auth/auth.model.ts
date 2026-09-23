import { User } from '../users/user.model';

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}
