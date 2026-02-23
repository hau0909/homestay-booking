// trietcmce180982_sprint2
import { supabase } from '../../lib/supabase';

export async function getMostBookedListings() {
	// Lấy danh sách listing cùng số lượt book từ bảng bookings

	const { data, error } = await supabase
		.from('listings')
		.select('id, title, image, price, location, bookings(id)')
		.limit(20);

	console.log('getMostBookedListings result:', data, error);

	if (error || !data) {
		return [];
	}

	// Tính số lượt book cho từng listing
	const listingsWithBookCount = data.map((listing: any) => ({
		...listing,
		bookCount: listing.bookings ? listing.bookings.length : 0,
	}));

	// Sắp xếp theo số lượt book giảm dần và lấy top 6
	listingsWithBookCount.sort((a: any, b: any) => b.bookCount - a.bookCount);
	return listingsWithBookCount.slice(0, 6);
}
