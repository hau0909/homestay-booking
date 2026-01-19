"use client";

import {
  Heart,
  Bed,
  Bath,
  Car,
  PawPrint,
  MoreHorizontal,
  Wifi,
  LucideIcon,
} from "lucide-react";
import { useState } from "react";
import type { PropertyData, AmenityType } from "@/src/data/properties";

interface FeaturedPropertyCardProps {
  property: PropertyData;
  onWishlistToggle?: () => void;
  isWishlisted?: boolean;
}

const amenityIconMap: Record<AmenityType, LucideIcon> = {
  bedrooms: Bed,
  bathrooms: Bath,
  parking: Car,
  pets: PawPrint,
  wifi: Wifi,
};

export default function FeaturedPropertyCard({
  property,
  onWishlistToggle,
  isWishlisted = false,
}: FeaturedPropertyCardProps) {
  const [wishlist, setWishlist] = useState(isWishlisted);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  const handleWishlistClick = () => {
    setWishlist(!wishlist);
    onWishlistToggle?.();
  };

  const maxVisibleAmenities = 5;
  const amenities = property.amenities || [];
  const visibleAmenities = amenities.slice(0, maxVisibleAmenities);
  const remainingCount = amenities.length - maxVisibleAmenities;

  return (
    <div className="group rounded-3xl bg-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg">
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Wishlist Heart - Top Right */}
        <button
          onClick={handleWishlistClick}
          className="absolute right-6 top-6 z-10 transition-all duration-300 hover:scale-110"
        >
          <Heart
            size={24}
            className={`${
              wishlist
                ? "fill-red-500 text-red-500"
                : "fill-gray-400 text-gray-400"
            } transition-colors duration-300`}
          />
        </button>

        {/* Price and More Button - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-between">
          <div className="text-white">
            <p className="text-lg font-semibold">
              $ {property.priceMin} - {property.priceMax} USD
            </p>
          </div>
          <button className="flex items-center gap-1 text-white hover:opacity-80 transition-opacity">
            <MoreHorizontal size={24} />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Title */}
        <h3 className="mb-2 text-xl font-semibold text-gray-800 line-clamp-1">
          {property.title}
        </h3>

        {/* Address */}
        <p className="mb-4 text-sm text-gray-500 line-clamp-1">
          {property.address}
        </p>

        {/* Amenities */}
        <div className="flex items-center gap-6 text-gray-600">
          {visibleAmenities.map((amenity, index) => {
            const Icon = amenityIconMap[amenity.type];
            return (
              <div key={index} className="flex items-center gap-2">
                <Icon size={18} />
                {amenity.value !== undefined && (
                  <span className="text-sm">{amenity.value}</span>
                )}
              </div>
            );
          })}
          {remainingCount > 0 && (
            <button
              onClick={() => setShowAllAmenities(true)}
              className="text-sm font-medium text-gray-700 hover:cursor-pointer hover:text-gray-900 transition-colors"
            >
              +{remainingCount} more
            </button>
          )}
        </div>
      </div>

      {/* Amenities Popup */}
      {showAllAmenities && (
        <div
          className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAllAmenities(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                All Amenities
              </h3>
              <button
                onClick={() => setShowAllAmenities(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {amenities.map((amenity, index) => {
                const Icon = amenityIconMap[amenity.type];
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 text-gray-600"
                  >
                    <Icon size={20} />
                    <span className="text-sm capitalize">
                      {amenity.type}
                      {amenity.value !== undefined && `: ${amenity.value}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
