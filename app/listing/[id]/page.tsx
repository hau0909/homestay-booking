"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CompactSearchBar from "@/src/components/search/CompactSearchBar";
import { getListingDetail, ListingDetailWithHost } from "@/src/services/listing/getListingDetail";
import { getHostInfo, HostInfo } from "@/src/services/profile/getHostInfo";
import { getHomeByListingId } from "@/src/services/home/getHomeByListingId";
import { Home } from "@/src/types/home";
import { Users, Bed, Bath, MapPin, Share2, Heart, Grid3x3, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function ListingDetailPage() {
  const params = useParams();
  const listingId = params.id as string;
  
  const [listing, setListing] = useState<ListingDetailWithHost | null>(null);
  const [host, setHost] = useState<HostInfo | null>(null);
  const [home, setHome] = useState<Home | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const listingData = await getListingDetail(listingId);
        setListing(listingData);
        
        // Fetch home data directly
        const homeData = await getHomeByListingId(listingId);
        setHome(homeData);
        
        if (listingData?.host_id) {
          const hostData = await getHostInfo(listingData.host_id);
          setHost(hostData);
        }
      } catch (error) {
        console.error("Error fetching listing:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [listingId]);

  const formatPrice = (price: number | null) => {
    if (!price) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3">
          <div className="max-w-[1920px] mx-auto">
            <CompactSearchBar />
          </div>
        </header>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#328E6E]"></div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-white">
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3">
          <div className="max-w-[1920px] mx-auto">
            <CompactSearchBar />
          </div>
        </header>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Listing not found</h2>
            <Link href="/" className="text-[#328E6E] hover:underline">
              Return to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Image Gallery Modal
  if (showGallery) {
    return (
      <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 flex items-center justify-between z-10">
          <button 
            onClick={() => setShowGallery(false)}
            className="text-black hover:bg-gray-200 p-2 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-black hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-semibold underline">Share</span>
            </button>
            <button 
              onClick={() => setIsLiked(!isLiked)}
              className="flex items-center gap-2 text-black hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              <span className="text-sm font-semibold underline">Save</span>
            </button>
          </div>
        </div>

        {/* Images Grid */}
        <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {listing.all_images.map((image, index) => (
            <div key={index} className="relative aspect-[4/3]">
              <img
                src={image}
                alt={`${listing.title} - Image ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-[1920px] mx-auto">
          <CompactSearchBar />
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Title & Actions */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold leading-tight text-black">{listing.title}</h1>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Share2 className="w-4 h-4 text-black" />
              <span className="text-sm font-semibold text-black underline">Share</span>
            </button>
            <button 
              onClick={() => setIsLiked(!isLiked)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-black'}`} />
              <span className="text-sm font-semibold text-black underline">Save</span>
            </button>
          </div>
        </div>

        {/* Images Grid */}
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[500px] mb-8 rounded-2xl overflow-hidden">
          {listing.all_images.length > 0 ? (
            <>
              {/* Main Image - Takes left half */}
              <div className="col-span-2 row-span-2 relative">
                <img
                  src={listing.all_images[0]}
                  alt={listing.title}
                  className="w-full h-full object-cover cursor-pointer hover:brightness-90 transition-all"
                  onClick={() => {/* TODO: Open image gallery */}}
                />
              </div>
              
              {/* Right side - 4 smaller images */}
              {listing.all_images.slice(1, 5).map((image, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={image}
                    alt={`${listing.title} ${idx + 2}`}
                    className="w-full h-full object-cover cursor-pointer hover:brightness-90 transition-all"
                    onClick={() => setShowGallery(true)}
                  />
                  {idx === 3 && (
                    <button
                      onClick={() => setShowGallery(true)}
                      className="absolute bottom-4 right-4 bg-white hover:bg-gray-100 px-4 py-2 rounded-lg flex items-center gap-2 border border-gray-900 transition-colors text-black"
                    >
                      <Grid3x3 className="w-4 h-4 text-black" />
                      <span className="text-sm font-semibold text-black">Show all photos</span>
                    </button>
                  )}
                </div>
              ))}
            </>
          ) : (
            <div className="col-span-4 row-span-2 bg-gray-200 flex items-center justify-center">
              <p className="text-gray-500">No images available</p>
            </div>
          )}
        </div>

        {/* Description and Details Below Images */}
        <div className="mt-4 pb-6">
          <h2 className="text-xl font-bold mb-3 text-black">{listing.description}</h2>
          <div className="text-sm text-gray-700 flex flex-wrap gap-x-6 gap-y-2">
            <span><strong>quantity:</strong> {home?.quantity ?? ""}</span>
            <span><strong>max_guests:</strong> {home?.max_guests ?? ""}</span>
            <span><strong>room_size:</strong> {home?.room_size ?? ""}</span>
          </div>
          <div className="text-sm text-gray-700 flex flex-wrap gap-x-6 gap-y-2 mt-1">
            <span><strong>bed_count:</strong> {home?.bed_count ?? ""}</span>
            <span><strong>bath_count:</strong> {home?.bath_count ?? ""}</span>
          </div>
          <div className="w-2/3 border-b border-gray-200 mt-5"></div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-3 gap-12">
          {/* Left Column - Details */}
          <div className="col-span-2">
            {/* Host Info */}
            <div className="pb-6 border-b border-gray-200">
              <div className="flex items-center gap-4 mt-6">
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                  {host?.avatar_url ? (
                    <img src={host.avatar_url} alt={host.full_name || "Host"} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <Users className="w-6 h-6 text-gray-600" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-black">Host: {host?.full_name || ""}</p>
                  <p className="text-sm text-gray-500">New host</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="col-span-1">
            <div className="border border-gray-300 rounded-2xl p-6 shadow-lg sticky top-24">
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-2xl font-semibold underline text-black">{formatPrice(listing.price_weekday)}</span>
                <span className="text-black">/ weekday night</span>
              </div>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-2xl font-semibold underline text-black">{formatPrice(listing.price_weekend)}</span>
                <span className="text-black">/ weekend night</span>
              </div>

              <button className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-red-600 transition-all mb-4">
                Book Now
              </button>

              <p className="text-center text-sm text-gray-500">
                You won't be charged yet
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
