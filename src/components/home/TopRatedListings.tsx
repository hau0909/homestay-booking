// trietcmce180982_sprint2

"use client";
import ItemCard from "../common/ItemCard";
import { ListingType } from "@/src/types/enums";
import { useEffect, useState } from "react";
import { getTopRatedListings } from "../../services/listing/getTopRatedListings";


export default function TopRatedListings() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      const data = await getTopRatedListings();
      setListings(data);
      setLoading(false);
    }
    fetchListings();
  }, []);

  if (loading) return <div>Loading top rated listings...</div>;

  return (
    <section className="w-full py-16 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex justify-between items-start">
          <h2 className="text-4xl font-bold text-[#328E6E]">Top Rated Listings</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {listings.map((listing) => (
            <ItemCard
              key={listing.id}
              type={"HOME" as ListingType}
              title={listing.title}
              image={listing.image}
              address={listing.location}
              rating={listing.averageRating}
              showRating={true}
              price={listing.price}
              nights={2}
              isGuestFavorite={false}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
