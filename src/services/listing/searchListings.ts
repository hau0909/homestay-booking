import { supabase } from "@/src/lib/supabase";

export interface ListingWithDetails {
  id: number;
  title: string;
  description: string | null;
  province_code: string | null;
  district_code: string | null;
  address_detail: string | null;
  latitude: number | null;
  longitude: number | null;
  category_id: number | null;
  // Home info
  max_guests: number | null;
  bed_count: number | null;
  bath_count: number | null;
  price_weekday: number | null;
  price_weekend: number | null;
  // Location names
  province_name: string | null;
  district_name: string | null;
  // Category
  category_name: string | null;
  // Images
  thumbnail_url: string | null;
  all_images: string[];
}

export interface SearchParams {
  provinceCode?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  page?: number;
  limit?: number;
}

export async function searchListings(params: SearchParams = {}): Promise<{
  listings: ListingWithDetails[];
  total: number;
}> {
  const { provinceCode, page = 1, limit = 20 } = params;
  const offset = (page - 1) * limit;

  try {
    // Build base query
    let query = supabase
      .from("listings")
      .select(
        `
        id,
        title,
        description,
        province_code,
        district_code,
        address_detail,
        latitude,
        longitude,
        category_id,
        homes (
          max_guests,
          bed_count,
          bath_count,
          price_weekday,
          price_weekend
        ),
        provinces (
          name
        ),
        districts (
          name
        ),
        categories (
          name
        ),
        listing_images (
          url,
          is_thumbnail
        )
      `,
        { count: "exact" }
      )
      .eq("status", "ACTIVE")
      .eq("listing_type", "HOME");

    // Filter by province if provided
    if (provinceCode) {
      query = query.eq("province_code", provinceCode);
    }

    // Order by created date
    query = query.order("created_at", { ascending: false });

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("searchListings error:", error);
      return { listings: [], total: 0 };
    }

    // Transform data
    const listings: ListingWithDetails[] = (data || []).map((item: any) => {
      const home = Array.isArray(item.homes) ? item.homes[0] : item.homes;
      const province = Array.isArray(item.provinces) ? item.provinces[0] : item.provinces;
      const district = Array.isArray(item.districts) ? item.districts[0] : item.districts;
      const category = Array.isArray(item.categories) ? item.categories[0] : item.categories;
      
      const images = item.listing_images || [];
      const thumbnailImage = images.find((img: any) => img.is_thumbnail);
      const allImageUrls = images.map((img: any) => img.url);

      return {
        id: item.id,
        title: item.title,
        description: item.description,
        province_code: item.province_code,
        district_code: item.district_code,
        address_detail: item.address_detail,
        latitude: item.latitude,
        longitude: item.longitude,
        category_id: item.category_id,
        max_guests: home?.max_guests || null,
        bed_count: home?.bed_count || null,
        bath_count: home?.bath_count || null,
        price_weekday: home?.price_weekday || null,
        price_weekend: home?.price_weekend || null,
        province_name: province?.name || null,
        district_name: district?.name || null,
        category_name: category?.name || null,
        thumbnail_url: thumbnailImage?.url || allImageUrls[0] || null,
        all_images: allImageUrls,
      };
    });

    return {
      listings,
      total: count || 0,
    };
  } catch (error) {
    console.error("searchListings unexpected error:", error);
    return { listings: [], total: 0 };
  }
}
