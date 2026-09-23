import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Conversation, Message } from './message.model';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private readonly http = inject(HttpClient);

  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${environment.apiUrl}/api/conversations`);
  }

  getMessages(otherUserId: string): Observable<Message[]> {
    return this.http.get<Message[]>(
      `${environment.apiUrl}/api/conversations/${otherUserId}/messages`,
    );
  }
}
