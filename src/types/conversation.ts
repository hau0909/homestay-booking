export interface Conversation {
  id: string; // uuid
  host_id: string;
  guest_id: string;
  last_message_content: string | null;
  updated_at: string;
}
