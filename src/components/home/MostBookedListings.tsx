// trietcmce180982_sprint2

"use client";
import ItemCard from "../common/ItemCard";
import { useEffect, useState } from "react";
import { getHomeByListingId } from "@/src/services/home/getHomeByListingId";
import { getTopBookedListings } from "@/src/services/listing/getLatestAndTopRatedListings";
import Link from "next/link";
import { useWishlist } from "@/src/context/WishlistContext";
import { supabase } from "@/src/lib/supabase";
import { useAuth } from "@/src/hooks/useAuth";


export default function MostBookedListings() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { wishlist, refreshWishlist } = useWishlist();
  const { user } = useAuth();

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      const data = await getTopBookedListings();
      setListings(data.slice(0, 6));
      setLoading(false);
    }
    fetchListings();
  }, []);

  // Hàm thêm/xóa wishlist
  const handleToggleWishlist = async (listingId: number) => {
    if (!user) return;
    const isInWishlist = wishlist.some((item) => item.listing_id === listingId);
    if (isInWishlist) {
      const { error } = await supabase
        .from("wishlists")
        .delete()
        .eq("user_id", user.id)
        .eq("listing_id", listingId);
      if (!error) {
        refreshWishlist();
      } else {
        // eslint-disable-next-line no-console
        console.error("Remove from wishlist failed", error);
      }
    } else {
      const { error } = await supabase.from("wishlists").insert({
        user_id: user.id,
        listing_id: listingId,
      });
      if (!error) {
        refreshWishlist();
      } else {
        // eslint-disable-next-line no-console
        console.error("Add to wishlist failed", error);
      }
    }
  };

  const [homePrices, setHomePrices] = useState<Record<number, number>>({});

  useEffect(() => {
    async function fetchHomePrices() {
      const prices: Record<number, number> = {};
      await Promise.all(
        listings.filter((listing) => listing.listing_type === "HOME").map(async (listing) => {
          const home = await getHomeByListingId(listing.id);
          prices[listing.id] = home?.price_weekday || 0;
        })
      );
      setHomePrices(prices);
    }
    if (listings.length > 0) fetchHomePrices();
  }, [listings]);

  if (loading) return <div>Loading most booked listings...</div>;

  return (
    <section className="w-full py-16 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex justify-between items-start">
          <h2 className="text-4xl font-bold text-[#328E6E]">Most Booked Listings</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {listings
            .filter((listing) => listing.listing_type === "HOME" && listing.id !== 1 && listing.id !== 2)
            .map((listing) => (
            <Link
              key={listing.id}
              href={`/listing/${listing.id}`}
              style={{ display: "block", height: "100%" }}
            >
              <ItemCard
                type={listing.listing_type}
                title={listing.title}
                address={listing.address_detail ?? ""}
                image={listing.thumbnail_url}
                rating={listing.average_rating || 5}
                showRating={true}
                price={homePrices[listing.id]}
                nights={2}
                isGuestFavorite={listing.total_bookings > 10}
                isWishlisted={wishlist.some((item) => item.listing_id === listing.id)}
                onWishlistToggle={() => handleToggleWishlist(listing.id)}
              />
              <div className="mt-1 text-xs text-gray-700 font-medium">
                Weekday Price: <span className="font-bold">{Number(homePrices[listing.id] || 0).toLocaleString("en-US", { style: "currency", currency: "USD" })}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
