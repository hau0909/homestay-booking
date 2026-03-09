import { supabase } from "@/src/lib/supabase";
import { ListingWithDetails } from "../listing/searchListings";

export interface SearchExperienceParams {
  provinceCode?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
  amenityIds?: number[];
  sortBy?: string[];
}

export async function searchExperiences(params: SearchExperienceParams = {}): Promise<{
  listings: ListingWithDetails[];
  total: number;
}> {
  const { provinceCode, checkIn, checkOut, guests, minPrice, maxPrice, amenityIds, sortBy, page = 1, limit = 20 } = params;
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
        created_at,
        experiences (
          price_per_person
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
      .eq("listing_type", "EXPERIENCE");

    // Filter by province
    if (provinceCode) {
      query = query.eq("province_code", provinceCode);
    }

    // Filter by price_per_person
    if (minPrice !== undefined || maxPrice !== undefined) {
      let priceQuery = supabase.from("experiences").select("listing_id, price_per_person");
      if (minPrice !== undefined) {
        priceQuery = priceQuery.gte("price_per_person", minPrice);
      }
      if (maxPrice !== undefined) {
        priceQuery = priceQuery.lte("price_per_person", maxPrice);
      }
      const { data: validPrices, error: priceError } = await priceQuery;
      if (priceError) {
        console.error("Price filter error:", priceError);
        return { listings: [], total: 0 };
      }
      if (!validPrices || validPrices.length === 0) {
        return { listings: [], total: 0 };
      }
      const priceFilteredListingIds = validPrices.map((h: any) => h.listing_id);
      query = query.in("id", priceFilteredListingIds);
    }

    // Filter by amenities
    if (amenityIds && amenityIds.length > 0) {
      const { data: validAmenities, error: amenitiesError } = await supabase
        .from("listing_amenities")
        .select("listing_id, amenity_id");
      if (amenitiesError) {
        console.error("Amenities filter error:", amenitiesError);
        return { listings: [], total: 0 };
      }
      if (!validAmenities || validAmenities.length === 0) {
        return { listings: [], total: 0 };
      }
      // Group by listing_id, filter listing có đủ tất cả amenityIds
      const listingAmenityCount: { [key: number]: number } = {};
      validAmenities.forEach((item: any) => {
        if (amenityIds.includes(item.amenity_id)) {
          listingAmenityCount[item.listing_id] = (listingAmenityCount[item.listing_id] || 0) + 1;
        }
      });
      const amenityFilteredListingIds = Object.keys(listingAmenityCount)
        .filter(listingId => listingAmenityCount[Number(listingId)] === amenityIds.length)
        .map(id => Number(id));
      if (amenityFilteredListingIds.length === 0) {
        return { listings: [], total: 0 };
      }
      query = query.in("id", amenityFilteredListingIds);
    }

    // Multi-sort: sortBy có thể chứa nhiều option
    let hasRatingSort = false;
    let hasPriceSort = false;
    let hasNewestSort = false;
    if (sortBy && sortBy.length > 0) {
      hasRatingSort = sortBy.includes("rating");
      hasPriceSort = sortBy.includes("price_low") || sortBy.includes("price_high");
      hasNewestSort = sortBy.includes("newest");
      // Prefer server-side ordering when possible so pagination is correct.
      // Order by experience price on the DB when user requests price sorting.
      if (hasPriceSort) {
        const asc = sortBy.includes("price_low");
        query = query.order("price_per_person", { ascending: asc, foreignTable: "experiences" });
      } else if (hasNewestSort || (!hasPriceSort && !hasRatingSort)) {
        query = query.order("created_at", { ascending: false });
      }
    } else {
      query = query.order("created_at", { ascending: false });
    }
    
    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) {
      console.error("searchExperiences error:", error);
      return { listings: [], total: 0 };
    }

    let listings: ListingWithDetails[] = (data || []).map((item: any) => {
      const exp = Array.isArray(item.experiences) ? item.experiences[0] : item.experiences;
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
        // Mock home fields for compatibility
        max_guests: null,
        bed_count: null,
        bath_count: null,
        price_weekday: exp?.price_per_person || null, // Map per person price to weekday for UI reuse
        price_weekend: exp?.price_per_person || null,
        province_name: province?.name || null,
        district_name: district?.name || null,
        category_name: category?.name || null,
        thumbnail_url: thumbnailImage?.url || allImageUrls[0] || null,
        all_images: allImageUrls,
        created_at: item.created_at,
        average_rating: null,
        listing_type: "EXPERIENCE",
      };
    });

    // Determine if the user has applied any filters/sort that should hide unavailable/blocked listings
    const isFiltered = Boolean(
      provinceCode ||
      checkIn ||
      checkOut ||
      guests ||
      (minPrice !== undefined) ||
      (maxPrice !== undefined) ||
      (amenityIds && amenityIds.length > 0) ||
      (sortBy && sortBy.length > 0)
    );

    // Fetch calendar data to determine availability and blocked status per listing
    const { data: calendarData, error: calendarError } = await supabase
      .from("calendar")
      .select("listing_id, available_count, is_block");

    let listingIdsWithZeroAvailable = new Set<number>();
    let listingIdsWithBlocked = new Set<number>();
    if (!calendarError && calendarData) {
      calendarData.forEach((c: any) => {
        if (c.available_count === 0) listingIdsWithZeroAvailable.add(c.listing_id);
        if (c.is_block === true) listingIdsWithBlocked.add(c.listing_id);
      });
    }

    // If user has filters active, hide listings that have zero availability or are blocked.
    // Otherwise (no filters), show them but mark as not bookable.
    if (isFiltered) {
      listings = listings.filter(l => !listingIdsWithZeroAvailable.has(l.id) && !listingIdsWithBlocked.has(l.id));
    } else {
      listings = listings.map(l => ({
        ...l,
        is_blocked: listingIdsWithBlocked.has(l.id),
        is_bookable: !(listingIdsWithZeroAvailable.has(l.id) || listingIdsWithBlocked.has(l.id)),
      }));
    }

    // Sort lại ở phía client nếu có price/rating
    if (listings.length > 0) {
      // Luôn tính average_rating cho mọi listing
      let ratingMap: { [key: number]: number } = {};
      let countMap: { [key: number]: number } = {};
      const listingIds = listings.map(l => Number(l.id));
      const { data: reviews, error: reviewError } = await supabase
        .from("reviews")
        .select("listing_id, rating");
      if (!reviewError && reviews) {
        reviews.forEach((r: any) => {
          const lid = Number(r.listing_id);
          if (listingIds.includes(lid)) {
            ratingMap[lid] = (ratingMap[lid] || 0) + r.rating;
            countMap[lid] = (countMap[lid] || 0) + 1;
          }
        });
        listings = listings.map(l => {
          const lid = Number(l.id);
          return {
            ...l,
            average_rating: countMap[lid] ? ratingMap[lid] / countMap[lid] : null
          };
        });
      }
      // Chỉ sort theo rating nếu user chọn "top rated"
      if (hasPriceSort || hasRatingSort || hasNewestSort) {
        listings.sort((a, b) => {
          for (const option of (sortBy || [])) {
            if (option === "rating") {
              const rDiff = (b.average_rating || 0) - (a.average_rating || 0);
              if (rDiff !== 0) return rDiff;
            }
            if (option === "price_low") {
              const diff = (a.price_weekday || 0) - (b.price_weekday || 0);
              if (diff !== 0) return diff;
            }
            if (option === "price_high") {
              const diff = (b.price_weekday || 0) - (a.price_weekday || 0);
              if (diff !== 0) return diff;
            }
            if (option === "newest") {
              const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
              const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
              const diff = dateB.getTime() - dateA.getTime();
              if (diff !== 0) return diff;
            }
          }
          return 0;
        });
      }
    }

    return {
      listings,
      total: listings.length,
    };
  } catch (error) {
    console.error("searchExperiences unexpected error:", error);
    return { listings: [], total: 0 };
  }
}
