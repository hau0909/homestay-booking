"use client";
// trietcmce180982_sprint3
import React, { useEffect, useState } from "react";
import ToggleWishlistAction from "../../src/components/wishlist/ToggleWishlistAction";
import { supabase } from "@/src/lib/supabase";
import { useAuth } from "@/src/hooks/useAuth";

export default function WishlistPage() {
  const { user, loading } = useAuth();
  const [wishlist, setWishlist] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchWishlist = async () => {
      const { data, error } = await supabase
        .from("wishlists")
        .select(`
          listing_id,
          created_at,
          listings (
            title,
            description,
            address_detail,
            listing_images (
              url,
              is_thumbnail
            )
          )
        `)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching wishlist:", error);
      } else {
        setWishlist(data || []);
      }
    };

    fetchWishlist();
  }, [user]);

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h2 className="text-3xl font-bold mb-8">My Wishlist ❤️</h2>

      {wishlist.length === 0 ? (
        <p className="text-gray-500">No wishlist items found.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {wishlist.map((item) => {
            const listing = item.listings;

            const thumbnail =
              listing?.listing_images?.find((img: any) => img.is_thumbnail)
                ?.url || listing?.listing_images?.[0]?.url;

            return (
              <div
                key={item.listing_id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300"
              >
                {/* Image or Placeholder */}
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt={listing?.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center bg-gray-200 text-gray-500">
                    No Image Available
                  </div>
                )}

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold mb-2 line-clamp-1">
                    {listing?.title || "No title"}
                  </h3>

                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {listing?.description || "No description"}
                  </p>

                  <p className="text-gray-500 text-sm mb-3">
                    📍 {listing?.address_detail || "No address"}
                  </p>

                  <p className="text-xs text-gray-400 mb-4">
                    Added: {new Date(item.created_at).toLocaleDateString()}
                  </p>

                  <ToggleWishlistAction listingId={item.listing_id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}