"use client";

import { Heart, Star } from "lucide-react";
import { useState } from "react";
import { ListingType } from "@/src/types/enums";

interface ItemCardProps {
  type: ListingType;
  title: string;
  address: string;
  image?: string;
  rating?: number;
  showRating?: boolean;
  onWishlistToggle?: () => void;
  isWishlisted?: boolean;
  price?: number;
  nights?: number;
  isGuestFavorite?: boolean;
}

export default function ItemCard({
  title,
  image,
  rating = 5,
  showRating = true,
  onWishlistToggle,
  isWishlisted = false,
  price,
  nights = 2,
  isGuestFavorite = false,
}: ItemCardProps) {
  const [wishlist, setWishlist] = useState(isWishlisted);

  const handleWishlistClick = () => {
    setWishlist(!wishlist);
    onWishlistToggle?.();
  };

  const formatPrice = (price?: number) => {
    if (!price) return "";
    return `₫${price.toLocaleString("vi-VN")}`;
  };

  return (
    <div className="group relative overflow-hidden transition-all duration-300 hover:scale-95 hover:cursor-pointer ">
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden">
        {/* Guest Favorite Badge */}
        {isGuestFavorite && (
          <div className="absolute left-2 top-2 z-10 bg-gray-100 backdrop-blur-2xl rounded-full px-3 py-1 shadow-md">
            <span className="text-xs font-bold text-black">Guest favorite</span>
          </div>
        )}

        {/* Wishlist Heart - Top Right */}
        <button
          onClick={handleWishlistClick}
          className="absolute right-2 top-2 z-10 transition-all duration-300 hover:scale-110"
        >
          <Heart
            size={20}
            className={`${
              wishlist
                ? "fill-red-500 text-red-500"
                : "fill-white/80 text-white stroke-gray-600"
            } transition-colors duration-300`}
          />
        </button>

        {/* Main Image */}
        <img
          src={image}
          alt={title}
          className="h-full w-full rounded-2xl object-cover"
        />
      </div>

      {/* Content */}
      <div className="pt-2 pb-3">
        {/* Title */}
        <h3 className="mb-0.5 text-sm font-semibold text-gray-900 line-clamp-1">
          {title}
        </h3>

        {/* Price and Rating Row */}
        <div className="flex items-center gap-2">
          {/* Price */}
          {price && (
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-black">
                {formatPrice(price)}
              </span>
              <span className="text-xs text-gray-600">for {nights} nights</span>
            </div>
          )}

          {/* Rating */}
          {showRating && rating && (
            <div className="flex items-center gap-1">
              <Star size={12} className="fill-gray-900 text-gray-900" />
              <span className="text-xs font-medium text-gray-900">
                {rating.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
