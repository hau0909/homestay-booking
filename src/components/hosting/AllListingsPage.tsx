
"use client";
// trietcmce180982_sprint2

import { useEffect, useState } from "react";
import { getHostListings } from "@/src/services/listing/getHostListings";
import { getListingMainImages } from "@/src/services/listing/getListingMainImages";
import { Listing } from "@/src/types/listing";
import Link from "next/link";
import { updateListing } from "@/src/services/listing/updateListing";

export default function AllListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [images, setImages] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getHostListings()
      .then(async (data) => {
        setListings(data);
        const ids = data.map((l) => l.id);
        let imgMap: Record<number, string> = {};
        if (ids.length > 0) {
          try {
            imgMap = await getListingMainImages(ids);
          } catch {
            // Nếu lỗi lấy ảnh thì không set gì, sẽ fallback ảnh mặc định phía dưới
          }
        }
        ids.forEach(id => {
          if (!imgMap[id]) {
            imgMap[id] = "/placeholder-img.png";
          }
        });
        setImages(imgMap);
      })
      .catch(() => setError("Failed to load listings"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  const handleToggleStatus = async (listing: Listing) => {
    const newStatus = listing.status === "ACTIVE" ? "HIDDEN" : "ACTIVE";
    try {
      await updateListing(listing.id, { status: newStatus });
      setListings((prev) =>
        prev.map((l) =>
          l.id === listing.id ? { ...l, status: newStatus } : l
        )
      );
    } catch (e) {
      alert("Failed to update listing status");
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold mb-6 text-[#328E6E]">My Listings</h1>
      <div className="flex justify-end mb-6">
        <Link href="/hosting/listing/create" className="bg-[#328E6E] text-white px-4 py-2 rounded shadow hover:bg-[#256d52]">
          Create New Listing
        </Link>
      </div>
      {listings.length === 0 ? (
        <div className="text-gray-500">No listings found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <div key={listing.id} className="bg-white rounded-lg shadow p-4 flex flex-col h-full">
              <img
                src={images[listing.id]}
                alt={listing.title}
                className="w-full h-40 object-cover rounded mb-2"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/placeholder-img.png";
                }}
              />
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
              <button
                className={`px-3 py-1 rounded shadow mt-2 self-start ${
                  listing.status === "ACTIVE"
                    ? "bg-yellow-500 text-white hover:bg-yellow-600"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
                onClick={() => handleToggleStatus(listing)}
              >
                {listing.status === "ACTIVE" ? "Hide" : "Show"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
