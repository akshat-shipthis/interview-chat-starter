import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { Message } from '../messages/message.model';
import { ChatSocketService } from '../messages/chat-socket.service';
import { MessageService } from '../messages/message.service';
import { User } from '../users/user.model';
import { UserService } from '../users/user.service';

@Component({
  selector: 'app-chat',
  imports: [FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat implements OnInit, OnDestroy, AfterViewChecked {
  private readonly auth = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly messageService = inject(MessageService);
  private readonly socket = inject(ChatSocketService);

  private wsSub?: Subscription;
  private shouldScroll = false;

  /** All other users (contact list). */
  readonly users = signal<User[]>([]);

  /** Currently selected user to chat with. */
  readonly selectedUser = signal<User | null>(null);

  /** Messages in the active conversation. */
  readonly messages = signal<Message[]>([]);

  /** Unread counts keyed by user id. */
  readonly unreadCounts = signal<Record<string, number>>({});

  /** Two-way bound draft text. */
  readonly draft = signal('');

  /** Error message for failed sends. */
  readonly sendError = signal<string | null>(null);

  /** Current user's id for distinguishing own vs. other messages. */
  readonly currentUserId = computed(() => this.auth.currentUser()?.id ?? '');

  /** Reference to the scrollable message list. */
  private readonly messageList = viewChild<ElementRef<HTMLElement>>('messageList');

  ngOnInit(): void {
    // Load contact list
    this.userService.getUsers().subscribe((users) => this.users.set(users));

    // Connect WebSocket
    this.socket.connect();

    // Listen for incoming messages
    this.wsSub = this.socket.events.subscribe((event) => {
      if (event.type === 'message') {
        const msg = event.message;
        const myId = this.currentUserId();

        if (this.belongsToActiveConversation(msg)) {
          // Message is part of the currently open conversation
          // Avoid duplicates (sender gets echo)
          this.messages.update((msgs) => {
            if (msgs.some((m) => m.id === msg.id)) {
              return msgs;
            }
            return [...msgs, msg];
          });
          this.shouldScroll = true;
          // Scroll immediately after the next render
          setTimeout(() => this.scrollToBottom(), 0);
        } else if (msg.sender_id !== myId) {
          // Message from someone else in a different conversation
          // Increment unread count for that sender
          this.unreadCounts.update((counts) => ({
            ...counts,
            [msg.sender_id]: (counts[msg.sender_id] || 0) + 1,
          }));
        }
      }
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void {
    this.wsSub?.unsubscribe();
    this.socket.disconnect();
  }

  selectUser(user: User): void {
    this.selectedUser.set(user);
    this.messages.set([]);

    // Clear unread count for this user
    this.unreadCounts.update((counts) => {
      const copy = { ...counts };
      delete copy[user.id];
      return copy;
    });

    // Load message history via REST
    this.messageService.getMessages(user.id).subscribe((msgs) => {
      this.messages.set(msgs);
      this.shouldScroll = true;
      // Scroll after messages are rendered
      setTimeout(() => this.scrollToBottom(), 0);
    });
  }

  sendMessage(): void {
    const text = this.draft().trim();
    const partner = this.selectedUser();
    if (!text || !partner) {
      return;
    }
    
    const sent = this.socket.send(partner.id, text);
    if (sent) {
      this.draft.set('');
      this.sendError.set(null);
    } else {
      this.sendError.set('Message could not be sent. Reconnecting...');
      // Clear error after 3 seconds
      setTimeout(() => this.sendError.set(null), 3000);
    }
  }

  formatTime(iso: string): string {
    const date = new Date(iso);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private belongsToActiveConversation(msg: Message): boolean {
    const partner = this.selectedUser();
    const myId = this.currentUserId();
    if (!partner) {
      return false;
    }
    return (
      (msg.sender_id === partner.id && msg.receiver_id === myId) ||
      (msg.sender_id === myId && msg.receiver_id === partner.id)
    );
  }

  private scrollToBottom(): void {
    const el = this.messageList()?.nativeElement;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }
}
