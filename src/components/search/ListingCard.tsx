"use client";

import { Heart, Star, Users, Bed, Bath, MapPin } from "lucide-react";
import Link from "next/link";
import { ListingWithDetails } from "@/src/services/listing/searchListings";
import { useState } from "react";

interface ListingCardProps {
  listing: ListingWithDetails;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const images = listing.all_images.length > 0 ? listing.all_images : [listing.thumbnail_url || "/placeholder-home.jpg"];

  const formatPrice = (price: number | null) => {
    if (!price) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    // TODO: Save to wishlist in database
  };

  return (
    <Link href={`/listing/${listing.id}`}>
      <div className="group cursor-pointer">
        {/* Image Section */}
        <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
          <img
            src={images[currentImageIndex]}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Image Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-md"
              >
                <span className="text-black text-lg font-bold">←</span>
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-md"
              >
                <span className="text-black text-lg font-bold">→</span>
              </button>

              {/* Image Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      idx === currentImageIndex
                        ? "bg-white w-4"
                        : "bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleLike}
            className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white transition-colors hover:scale-110 transform"
          >
            <Heart 
              className={`w-4 h-4 transition-all ${
                isLiked 
                  ? 'fill-red-500 text-red-500' 
                  : 'text-gray-700 hover:text-red-500'
              }`} 
            />
          </button>

          {/* Guest Favorite Badge */}
          {listing.category_name && (
            <div className="absolute top-3 left-3 px-3 py-1 bg-white rounded-full text-xs font-semibold">
              Guest favorite
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="space-y-1">
          {/* Location & Rating */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <MapPin className="w-3.5 h-3.5" />
              <span className="font-medium text-gray-900">
                {listing.province_name || "Vietnam"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-current text-black" />
              <span className="text-sm font-medium">
                {listing.average_rating !== undefined && listing.average_rating !== null
                  ? listing.average_rating.toFixed(2)
                  : 'N/A'}
              </span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
            {listing.title}
          </h3>

          {/* Amenities */}
          <div className="flex items-center gap-3 text-xs text-gray-600">
            {listing.max_guests && (
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{listing.max_guests}</span>
              </div>
            )}
            {listing.bed_count && (
              <div className="flex items-center gap-1">
                <Bed className="w-3.5 h-3.5" />
                <span>{listing.bed_count}</span>
              </div>
            )}
            {listing.bath_count && (
              <div className="flex items-center gap-1">
                <Bath className="w-3.5 h-3.5" />
                <span>{listing.bath_count}</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="pt-1">
            <span className="text-sm font-semibold text-gray-900">
              {formatPrice(listing.price_weekday)}
            </span>
            <span className="text-sm text-gray-600"> / night</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
