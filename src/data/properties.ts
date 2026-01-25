import { ListingType } from "@/src/types/enums";

// Combined type for display purposes (Listing + Home + Images)
export interface PropertyDisplayData {
  // From Listing
  id: number;
  title: string;
  address_detail: string;
  listing_type: ListingType;

  // From Home
  price_weekday: number;
  bed_count: number | null;
  bath_count: number | null;

  // From ListingImage
  thumbnail_url: string;

  // Display-specific fields
  rating: number;
  isGuestFavorite?: boolean;
  nights?: number; // For price calculation display
}

export const propertiesData: PropertyDisplayData[] = [
  {
    id: 1,
    listing_type: "HOME",
    title: "Well Furnished Apartment",
    address_detail: "100 Smart Street, LA, USA",
    rating: 5,
    thumbnail_url:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    price_weekday: 1997060,
    bed_count: 3,
    bath_count: 1,
    nights: 2,
    isGuestFavorite: true,
  },
  {
    id: 2,
    listing_type: "HOME",
    title: "Comfortable Family Flat",
    address_detail: "100 Smart Street, LA, USA",
    rating: 5,
    thumbnail_url:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    price_weekday: 2478205,
    bed_count: 3,
    bath_count: 1,
    nights: 2,
    isGuestFavorite: true,
  },
  {
    id: 3,
    listing_type: "HOME",
    title: "Beach House Summer",
    address_detail: "100 Smart Street, LA, USA",
    rating: 4.5,
    thumbnail_url:
      "https://images.unsplash.com/photo-1499916078039-922301b0eb9b?w=800&q=80",
    price_weekday: 1997060,
    bed_count: 3,
    bath_count: 1,
    nights: 2,
    isGuestFavorite: true,
  },
  {
    id: 4,
    listing_type: "HOME",
    title: "Double Size Room",
    address_detail: "100 Smart Street, LA, USA",
    rating: 5,
    thumbnail_url:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    price_weekday: 1737199,
    bed_count: 3,
    bath_count: 1,
    nights: 2,
    isGuestFavorite: true,
  },
  {
    id: 5,
    listing_type: "HOME",
    title: "Modern Loft",
    address_detail: "100 Smart Street, LA, USA",
    rating: 4.8,
    thumbnail_url:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
    price_weekday: 2225295,
    bed_count: 3,
    bath_count: 1,
    nights: 2,
    isGuestFavorite: true,
  },
  {
    id: 6,
    listing_type: "HOME",
    title: "Cozy Studio",
    address_detail: "100 Smart Street, LA, USA",
    rating: 4.7,
    thumbnail_url:
      "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800&q=80",
    price_weekday: 726750,
    bed_count: 1,
    bath_count: 1,
    nights: 2,
    isGuestFavorite: false,
  },
  {
    id: 7,
    listing_type: "HOME",
    title: "Luxury Penthouse",
    address_detail: "100 Smart Street, LA, USA",
    rating: 4.9,
    thumbnail_url:
      "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800&q=80",
    price_weekday: 3500000,
    bed_count: 4,
    bath_count: 3,
    nights: 2,
    isGuestFavorite: true,
  },
];
