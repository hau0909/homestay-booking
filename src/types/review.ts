export interface Review {
  id: number;
  booking_id: number;
  user_id: string;
  listing_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
}
