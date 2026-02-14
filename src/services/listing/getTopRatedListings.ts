// trietcmce180982_sprint2
import { supabase } from '../../lib/supabase';

export async function getTopRatedListings() {

  // 1. Lấy tất cả listings
  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select('id, title, image, location, price')
    .limit(20);

  // 2. Lấy tất cả reviews
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('listing_id, rating');

  console.log('TopRatedListings listings:', listings, 'reviews:', reviews, 'errors:', listingsError, reviewsError);

  if (listingsError || reviewsError || !listings) {
    return [];
  }

  // 3. Tính averageRating cho từng listing
  const listingsWithAvg = listings.map((listing: any) => {
    const ratings = reviews
      ? reviews.filter((r: any) => r.listing_id === listing.id).map((r: any) => r.rating)
      : [];
    const averageRating = ratings.length
      ? ratings.reduce((sum: number, r: number) => sum + r, 0) / ratings.length
      : null;
    return {
      ...listing,
      averageRating,
    };
  });

  // 4. Sắp xếp và lấy top 6
  listingsWithAvg.sort((a: any, b: any) => (b.averageRating || 0) - (a.averageRating || 0));
  return listingsWithAvg.slice(0, 6);
}
