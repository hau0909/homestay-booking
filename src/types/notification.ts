export type NotificationType = "BOOKING" | "SYSTEM" | "PROMO";

export interface Notification {
  id: number;
  user_id: string;
  title: string | null;
  message: string | null;
  type: NotificationType | null;
  is_read: boolean;
  created_at: string;
}
