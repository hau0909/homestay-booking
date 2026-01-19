export interface Experience {
  listing_id: number;
  price_per_person: number;
  duration_minutes: number | null;
  meeting_point: string | null;
  activity_level: string | null;
  group_size_limit: number | null;
  included_items: string | null;
}
