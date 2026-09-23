export interface Conversation {
  id: string;
  participants: string[];
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  text: string;
  created_at: string;
  updated_at: string;
}

export interface WsMessageEvent {
  type: 'message';
  conversation_id: string;
  message: Message;
}

export type WsEvent = WsMessageEvent;
