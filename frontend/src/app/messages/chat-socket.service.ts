import { Injectable, NgZone, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { WsEvent } from './message.model';

@Injectable({
  providedIn: 'root',
})
export class ChatSocketService {
  private readonly auth = inject(AuthService);
  private readonly zone = inject(NgZone);

  private socket: WebSocket | null = null;
  private readonly events$ = new Subject<WsEvent>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  /** Observable stream of all incoming WebSocket events. */
  readonly events: Observable<WsEvent> = this.events$.asObservable();

  /** Open the WebSocket connection. Safe to call multiple times. */
  connect(): void {
    if (this.socket) {
      return;
    }
    const token = this.auth.token;
    if (!token) {
      return;
    }

    const wsUrl = environment.apiUrl.replace(/^http/, 'ws');
    this.socket = new WebSocket(`${wsUrl}/ws?token=${token}`);

    this.socket.onmessage = (event) => {
      try {
        const data: WsEvent = JSON.parse(event.data);
        // Run inside Angular zone so change detection picks it up
        this.zone.run(() => this.events$.next(data));
      } catch {
        // Ignore malformed frames
      }
    };

    this.socket.onclose = () => {
      this.socket = null;
      this.scheduleReconnect();
    };

    this.socket.onerror = () => {
      this.socket?.close();
    };
  }

  /** Send a chat message to another user. */
  send(receiverId: string, text: string): boolean {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          type: 'message',
          receiver_id: receiverId,
          text,
        }),
      );
      return true;
    }
    return false;
  }

  /** Close the connection and stop reconnecting. */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.socket?.close();
    this.socket = null;
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }
    // Only reconnect if the user is still authenticated
    if (!this.auth.token) {
      return;
    }
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 2000);
  }
}
