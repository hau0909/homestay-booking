"use client";

import { Heart, Star } from "lucide-react";
import { useState } from "react";

export type ItemType = "homestay" | "experience" | "service";

interface ItemCardProps {
  type: ItemType;
  title: string;
  address: string;
  image?: string;
  avatarImage?: string;
  rating?: number;
  showRating?: boolean;
  onWishlistToggle?: () => void;
  isWishlisted?: boolean;
}

export default function ItemCard({
  type,
  title,
  address,
  image,
  avatarImage,
  rating = 5,
  showRating = true,
  onWishlistToggle,
  isWishlisted = false,
}: ItemCardProps) {
  const [wishlist, setWishlist] = useState(isWishlisted);

  const handleWishlistClick = () => {
    setWishlist(!wishlist);
    onWishlistToggle?.();
  };

  const renderStars = () => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <>
        {/* Full Stars */}
        {Array.from({ length: fullStars }).map((_, index) => (
          <Star
            key={`full-${index}`}
            size={16}
            className="fill-gray-700 text-gray-700"
          />
        ))}

        {/* Half Star */}
        {hasHalfStar && (
          <div key="half" className="relative">
            <Star size={16} className="fill-gray-300 text-gray-300" />
            <div
              className="absolute top-0 left-0 overflow-hidden"
              style={{ width: "50%" }}
            >
              <Star size={16} className="fill-gray-700 text-gray-700" />
            </div>
          </div>
        )}

        {/* Empty Stars */}
        {Array.from({ length: emptyStars }).map((_, index) => (
          <Star
            key={`empty-${index}`}
            size={16}
            className="fill-gray-300 text-gray-300"
          />
        ))}
      </>
    );
  };

  return (
    <div className="group relative rounded-2xl bg-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg">
      {/* Wishlist Heart - Top Right */}
      <button
        onClick={handleWishlistClick}
        className="absolute right-6 top-6 z-10 transition-all duration-300 hover:scale-110"
      >
        <Heart
          size={24}
          className={`${
            wishlist ? "fill-red-500 text-red-500" : "fill-black text-white"
          } transition-colors duration-300`}
        />
      </button>

      {/* Main Image */}
      <div className="aspect-[4/3] w-full overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Rating Stars */}
        {showRating && <div className="mb-3 flex gap-1">{renderStars()}</div>}

        {/* Avatar Circle */}
        <div className="mb-4 h-16 w-16 rounded-full bg-gray-400 overflow-hidden">
          {avatarImage ? (
            <img
              src={avatarImage}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>

        {/* Title */}
        <h3 className="mb-2 text-xl font-semibold text-gray-800 line-clamp-1">
          {title}
        </h3>

        {/* Address */}
        <p className="text-sm text-gray-500 line-clamp-1">{address}</p>
      </div>
    </div>
  );
}
