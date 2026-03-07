export interface CancelledReason {
  id: number;
  booking_id: number;
  cancelled_by: string;
  reason: string;
  created_at: string;
}
