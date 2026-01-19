import { AmenityType } from "./enums";

export interface Amenity {
  id: number;
  name: string;
  icon_url: string | null;
  type: AmenityType;
}

export interface ListingAmenity {
  listing_id: number;
  amenity_id: number;
}
