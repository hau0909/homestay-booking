"use client";
import { useEffect, useState } from "react";
import { getHostListings } from "@/src/services/listing/getHostListings";
import { Listing } from "@/src/types/listing";
import Link from "next/link";

export default function AllListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getHostListings()
      .then((data) => setListings(data))
      .catch(() => setError("Failed to load listings"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold mb-6">All Listings</h1>
      {listings.length === 0 ? (
        <div className="text-gray-500">No listings found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <div key={listing.id} className="bg-white rounded-lg shadow p-4 flex flex-col h-full">
              <h2 className="text-xl font-bold mb-1">{listing.title}</h2>
              <div className="text-sm text-gray-500 mb-1">Type: {listing.listing_type}</div>
              <div className="text-sm text-gray-500 mb-1">Address: {listing.address_detail}</div>
              <div className="text-sm text-gray-500 mb-2">{listing.description}</div>
              <Link
                href={`/hosting/listing/edit/${listing.id}`}
                className="bg-[#328E6E] text-white px-3 py-1 rounded shadow hover:bg-[#256d52] mt-2 self-start"
              >
                Edit
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
