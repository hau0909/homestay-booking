export interface Experience {
  id: number;
  listing_id: number;

  title: string;
  description: string | null;

  price_per_person: number;

  created_at: string;
  updated_at: string;
}
