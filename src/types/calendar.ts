export interface Calendar {
  id: number;
  listing_id: number;
  date: string; // yyyy-mm-dd
  available_count: number;
  price: number | null;
}
