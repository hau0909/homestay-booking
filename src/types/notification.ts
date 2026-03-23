export type NotificationType = "CONFIRM" | "CANCEL" | "NEW";

export interface Notification {
  id: number;
  user_id: string;
  title: string | null;
  message: string | null;
  type: NotificationType | null;
  is_read: boolean;
  created_at: string;
}
