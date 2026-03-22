export interface CancelPolicy {
  id: number;
  listing_id: number;
  name: string | null;
  description: string | null;
  refund_percentage: number | null;
  cancel_before_hours: number | null;
  created_at: string;
  updated_at: string;
}
