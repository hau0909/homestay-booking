import { Listing } from "../../../../homestay-booking/src/types/listing";

/**
 * Extended listing type with calculated fields for display
 */
export interface ListingWithStats extends Listing {
  // Host information
  host_name?: string;
  host_avatar?: string;
  host_email?: string;
  host_phone?: string;

  // Category information
  category_name?: string;
  category_description?: string;

  // Statistics
  total_bookings?: number;
  total_reviews?: number;
  average_rating?: number;

  // Images
  images?: string[];
  primary_image?: string;
  thumbnail_url?: string;
}

/**
 * Response type for listing list queries
 */
export interface ListingsResponse {
  data: ListingWithStats[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Query parameters for listing searches
 */
export interface ListingQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: "created_at" | "price" | "rating" | "bookings";
  sortOrder?: "asc" | "desc";
  provinceCode?: string;
  districtCode?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
}
