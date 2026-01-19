export interface Home {
  listing_id: number;
  price_per_night: number;
  quantity: number;
  max_guests: number;
  bed_count: number | null;
  bath_count: number | null;
  room_size: number | null;
  check_in_time: string; // HH:mm:ss
  check_out_time: string; // HH:mm:ss
}
