import { ListingStatus, ListingType } from "./enums";

export interface Listing {
  id: number;
  host_id: string;
  category_id: number | null;

  title: string;
  description: string | null;
  listing_type: ListingType;
  status: ListingStatus;

  province_code: string | null;
  district_code: string | null;
  ward_code: string | null;
  address_detail: string | null;
  latitude: number | null;
  longitude: number | null;

  created_at: string;
  updated_at: string;
}
