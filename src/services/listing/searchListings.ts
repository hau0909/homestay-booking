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
  const { provinceCode, checkIn, checkOut, guests, page = 1, limit = 20 } = params;
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

    // Filter by guests if provided
    if (guests && guests > 0) {
      query = query.gte("homes.max_guests", guests);
    }

    // Filter by date availability if checkIn and checkOut provided
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      // Validate dates
      if (checkInDate >= checkOutDate) {
        console.warn("Invalid date range: checkIn >= checkOut");
        return { listings: [], total: 0 };
      }

      // Create array of dates from checkIn to checkOut (exclusive checkOut)
      const dates: string[] = [];
      const currentDate = new Date(checkInDate);
      while (currentDate < checkOutDate) {
        // Use local date format to avoid timezone issues
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        dates.push(`${year}-${month}-${day}`);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      if (dates.length === 0) {
        console.warn("No dates in range");
        return { listings: [], total: 0 };
      }

      console.log(`Checking availability for dates: ${dates.join(', ')}`);

      // Get listing IDs that have availability for all dates in the range
      const { data: availableListings, error: calendarError } = await supabase
        .from("calendar")
        .select("listing_id")
        .in("date", dates)
        .gt("available_count", 0);

      if (calendarError) {
        console.error("Calendar availability check error:", calendarError);
        return { listings: [], total: 0 };
      }

      if (!availableListings || availableListings.length === 0) {
        console.log("No listings available for selected dates");
        return { listings: [], total: 0 };
      }

      // Count how many dates each listing is available for
      const availabilityCount: { [key: number]: number } = {};
      availableListings.forEach((item: any) => {
        availabilityCount[item.listing_id] = (availabilityCount[item.listing_id] || 0) + 1;
      });

      // Filter listings that are available for ALL dates in the range
      const availableListingIds = Object.keys(availabilityCount)
        .filter(id => availabilityCount[Number(id)] === dates.length)
        .map(id => Number(id));

      console.log(`Found ${availableListingIds.length} listings available for all ${dates.length} dates`);

      if (availableListingIds.length === 0) {
        return { listings: [], total: 0 };
      }

      // Add filter for available listings
      query = query.in("id", availableListingIds);
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
