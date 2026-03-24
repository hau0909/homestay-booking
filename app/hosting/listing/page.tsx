"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getHostListings } from "@/src/services/listing/getHostListings";
import { getListingMainImages } from "@/src/services/listing/getListingMainImages";
import { useAuth } from "@/src/hooks/useAuth";
import { getProfile } from "@/src/services/profile/profile.service";
import { Listing } from "@/src/types/listing";
import toast from "react-hot-toast";
import ExperienceCard from "@/src/components/listing/ExperienceCard";
import { useSearchParams } from "next/navigation";

export default function HostListingsPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [listingImages, setListingImages] = useState<Record<number, string>>(
    {},
  );
  // TAB STATE
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<"HOME" | "EXPERIENCE">(
    (searchParams.get("tab") as "HOME" | "EXPERIENCE") || "HOME",
  );
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        if (user) {
          const profile = await getProfile(user.id);
          setIsHost(
            (profile.role === "USER" && profile.is_host) ||
              profile.role === "ADMIN",
          );
        }
        const data = await getHostListings(user?.id);
        setListings(data);
        // Lấy ảnh chính cho từng listing
        const ids = data.map((l) => l.id);
        if (ids.length > 0) {
          const images = await getListingMainImages(ids);
          setListingImages(images);
        } else {
          setListingImages({});
        }
      } catch {
        setError("Failed to load listings");
        toast.error("Failed to load listings");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  if (!user) {
    return <div className="p-8">Please log in to view your listings.</div>;
  }
  if (loading) {
    return <div className="p-8">Loading...</div>;
  }
  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }
  // ✅ FILTER THEO TAB
  const filteredListings = listings.filter((l) => l.listing_type === tab);
  return (
    <div className="max-w-7xl mx-auto py-10 px-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#328E6E]">My Listings</h1>
        <div className="flex gap-2">
          <a
            href="/hosting/listing/create"
            className="bg-[#328E6E] text-white px-4 py-2 rounded-lg"
          >
            Create New Homestay Listing
          </a>
          <a
            href="/hosting/listing/experience/create"
            className="bg-[#2ba3cb] text-white px-4 py-2 rounded-lg"
          >
            Create New Experience Listing
          </a>
        </div>
      </div>
      {/* ✅ TAB */}
      <div className="flex gap-6 border-b">
        <button
          onClick={() => setTab("HOME")}
          className={`pb-2 ${
            tab === "HOME"
              ? "border-b-2 border-green-600 text-green-600 font-semibold"
              : "text-gray-500"
          }`}
        >
          Home
        </button>

        <button
          onClick={() => setTab("EXPERIENCE")}
          className={`pb-2 ${
            tab === "EXPERIENCE"
              ? "border-b-2 border-green-600 text-green-600 font-semibold"
              : "text-gray-500"
          }`}
        >
          Experiences
        </button>
      </div>
      {listings.length === 0 ? (
        <div className="text-gray-500">No listings found.</div>
      ) : tab === "EXPERIENCE" ? (
        // ✅ LIST VIEW CHO EXPERIENCE
        <div className="bg-white rounded-xl shadow overflow-hidden mt-3">
          {/* HEADER */}
          <div className="grid grid-cols-[50px_110px_1.6fr_1.3fr_130px_150px_120px] items-center px-8 py-4 text-sm italic text-gray-500 border-b bg-gray-50">
            <div>#</div>
            <div>Image</div>
            <div>Title</div>
            <div>Address</div>
            <div>Price</div>
            <div>Created</div>
            <div>Status</div>
          </div>
          {/* ROWS */}
          {filteredListings.map((listing, index) => (
            <ExperienceCard key={listing.id} listing={listing} index={index} />
          ))}
        </div>
      ) : (
        // ✅ GIỮ NGUYÊN GRID CHO HOME
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
          {filteredListings.map((listing) => (
            <div key={listing.id} className="relative h-full">
              <div className="bg-white rounded-lg shadow p-4 flex flex-col h-full">
                {listingImages[listing.id] ? (
                  <img
                    src={listingImages[listing.id]}
                    alt={listing.title}
                    className="w-full h-40 object-cover rounded mb-3"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-200 flex items-center justify-center rounded mb-3 text-gray-400">
                    No Image
                  </div>
                )}

                <div className="flex-1 flex flex-col">
                  <h2 className="text-xl font-bold mb-1">{listing.title}</h2>
                  <div className="text-sm text-gray-500 mb-1">
                    Type: {listing.listing_type}
                  </div>
                  <div className="text-sm text-gray-500 mb-1">
                    Address: {listing.address_detail}
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    {listing.description}
                  </div>
                </div>

                {isHost && (
                  <a
                    href={`/hosting/listing/edit/${listing.id}`}
                    className="bg-[#328E6E] text-white px-3 py-1 rounded shadow hover:bg-[#256d52] mt-2 self-start"
                  >
                    Edit
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
