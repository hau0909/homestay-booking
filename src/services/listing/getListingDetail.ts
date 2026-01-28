import { supabase } from "@/src/lib/supabase";

export interface ListingDetailWithHost {
  id: number;
  title: string;
  description: string | null;
  province_code: string | null;
  district_code: string | null;
  address_detail: string | null;
  latitude: number | null;
  longitude: number | null;
  category_id: number | null;
  host_id: string;
  // Home info
  quantity: number | null;
  max_guests: number | null;
  bed_count: number | null;
  bath_count: number | null;
  room_size: number | null;
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

export async function getListingDetail(listingId: string): Promise<ListingDetailWithHost | null> {
  try {
    const { data, error } = await supabase
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
        host_id,
        homes (
          max_guests,
          bed_count,
          bath_count,
          price_weekday,
          price_weekend,
          quantity,
          room_size
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
          is_thumbnail,
          caption
        )
      `
      )
      .eq("id", listingId)
      .eq("status", "ACTIVE")
      .single();

    if (error) {
      console.error("getListingDetail error:", error);
      return null;
    }

    let home = Array.isArray(data.homes) ? data.homes[0] : data.homes;

    // Fallback: if home not returned by join, fetch directly by listing_id (ensure numeric)
    if (!home) {
      const listingNumericId = Number(listingId);
      const { data: homeRow } = await supabase
        .from("homes")
        .select(
          "max_guests, bed_count, bath_count, price_weekday, price_weekend, quantity, room_size"
        )
        .eq("listing_id", Number.isFinite(listingNumericId) ? listingNumericId : listingId)
        .single();
      home = homeRow || null;
    }
    const province = Array.isArray(data.provinces) ? data.provinces[0] : data.provinces;
    const district = Array.isArray(data.districts) ? data.districts[0] : data.districts;
    const category = Array.isArray(data.categories) ? data.categories[0] : data.categories;
    
    const images = data.listing_images || [];
    const thumbnailImage = images.find((img: any) => img.is_thumbnail);
    const allImageUrls = images.map((img: any) => img.url);

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      province_code: data.province_code,
      district_code: data.district_code,
      address_detail: data.address_detail,
      latitude: data.latitude,
      longitude: data.longitude,
      category_id: data.category_id,
      host_id: data.host_id,
      quantity: home?.quantity || null,
      max_guests: home?.max_guests || null,
      bed_count: home?.bed_count || null,
      bath_count: home?.bath_count || null,
      room_size: home?.room_size || null,
      price_weekday: home?.price_weekday || null,
      price_weekend: home?.price_weekend || null,
      province_name: province?.name || null,
      district_name: district?.name || null,
      category_name: category?.name || null,
      thumbnail_url: thumbnailImage?.url || allImageUrls[0] || null,
      all_images: allImageUrls,
    };
  } catch (error) {
    console.error("getListingDetail unexpected error:", error);
    return null;
  }
}
