export interface Message {
  id: number;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  image_url: string | null;
  is_read: boolean;
  created_at: string;
}
