export interface ListingImage {
  id: number;
  listing_id: number;
  url: string;
  caption: string | null;
  is_thumbnail: boolean;
  created_at: string;
}
