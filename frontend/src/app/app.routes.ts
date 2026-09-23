import { Routes } from '@angular/router';

import { authGuard } from './auth/auth-guard';
import { Chat } from './chat/chat';
import { Login } from './login/login';

export const routes: Routes = [
  { path: 'login', component: Login, title: 'Sign in' },
  { path: 'chat', component: Chat, canActivate: [authGuard], title: 'Chat' },
  { path: '**', redirectTo: 'chat' },
];
