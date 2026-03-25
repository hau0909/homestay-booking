"use client";

import ItemCard from "../common/ItemCard";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { useEffect, useState } from "react";
import { getHomeByListingId } from "@/src/services/home/getHomeByListingId";
import { getLatestListings } from "@/src/services/listing/getLatestAndTopRatedListings";
import Link from "next/link";
import { useWishlist } from "@/src/context/WishlistContext";
import { supabase } from "@/src/lib/supabase";
import { useAuth } from "@/src/hooks/useAuth";


export default function LatestProperties() {
  const [latestProperties, setLatestProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { wishlist, refreshWishlist } = useWishlist();
  const { user } = useAuth();

  useEffect(() => {
    async function fetchListings() {
      try {
        const listings = await getLatestListings();
        setLatestProperties(listings.slice(0, 6));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch latest listings", err);
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, []);

  // Hàm thêm vào wishlist
  const handleToggleWishlist = async (listingId: number) => {
    if (!user) return;
    const isInWishlist = wishlist.some((item) => item.listing_id === listingId);
    if (isInWishlist) {
      // Xóa khỏi wishlist
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
      // Thêm vào wishlist
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
        latestProperties.filter((property) => property.listing_type === "HOME").map(async (property) => {
          const home = await getHomeByListingId(property.id);
          prices[property.id] = home?.price_weekday || 0;
        })
      );
      setHomePrices(prices);
    }
    if (latestProperties.length > 0) fetchHomePrices();
  }, [latestProperties]);

  return (
    <section className="w-full py-16 px-6">
      <div className="mx-auto max-w-7xl">
        {/* Section Title */}
        <div className="mb-10 flex justify-between items-start">
          <div>
            <h2 className="text-4xl font-bold text-[#328E6E]">
              Newest on the Property Listing
            </h2>
          </div>
        </div>

        {/* Property Carousel */}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <Carousel
            opts={{
              align: "start",
              loop: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {latestProperties.filter((property) => property.listing_type === "HOME").map((property) => (
                <CarouselItem
                  key={property.id}
                  className="pl-4 md:basis-1/3 lg:basis-1/6"
                >
                  <Link
                    href={`/listing/${property.id}`}
                    style={{ display: "block", height: "100%" }}
                  >
                    <ItemCard
                      type={property.listing_type}
                      title={property.title}
                      address={property.address_detail ?? ""}
                      image={property.thumbnail_url}
                      rating={property.average_rating || 5}
                      showRating={true}
                      price={homePrices[property.id]}
                      nights={2}
                      isGuestFavorite={property.total_bookings > 10}
                      isWishlisted={wishlist.some((item) => item.listing_id === property.id)}
                      onWishlistToggle={() => handleToggleWishlist(property.id)}
                    />
                    <div className="mt-1 text-xs text-gray-700 font-medium">
                      Weekday Price: <span className="font-bold">${Number(homePrices[property.id] || 0).toLocaleString("en-US", { style: "currency", currency: "USD" })}</span>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="absolute -top-16 right-0 flex gap-3">
              <CarouselPrevious className="static translate-y-0 bg-transparent border-none hover:bg-transparent text-[#328E6E] hover:text-[#67AE6E]" />
              <CarouselNext className="static translate-y-0 bg-transparent border-none hover:bg-transparent text-[#328E6E] hover:text-[#67AE6E]" />
            </div>
          </Carousel>
        )}
      </div>
    </section>
  );
}
