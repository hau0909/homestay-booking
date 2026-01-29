export interface Home {
  listing_id: number;
  quantity: number;
  max_guests: number;
  bed_count: number | null;
  bath_count: number | null;
  room_size: number | null;
  price_weekday: number;
  price_weekend: number;
}
