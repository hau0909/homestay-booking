"use client";

import { useState, useEffect } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { Amenity } from "@/src/types/amenity";
import { getAmenities } from "@/src/services/amenity/amenity.service";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onApplyFilters: (filters: FilterState) => void;
}

export interface FilterState {
  minPrice: number;
  maxPrice: number;
  selectedAmenities: number[]; // Changed to number[] for amenity IDs
}

const MIN_PRICE = 0;
const MAX_PRICE = 1000;

export default function FilterModal({
  isOpen,
  onClose,
  total,
  onApplyFilters,
}: FilterModalProps) {
  // Price range filter state
  const [minPrice, setMinPrice] = useState(MIN_PRICE);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);

  // Amenities filter state
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
  const [showMoreAmenities, setShowMoreAmenities] = useState(false);
  const [loadingAmenities, setLoadingAmenities] = useState(true);

  // Fetch amenities from database when modal opens
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchAmenities = async () => {
      console.log("Fetching amenities...");
      setLoadingAmenities(true);
      const data = await getAmenities();
      console.log("Amenities loaded:", data);
      setAmenities(data);
      setLoadingAmenities(false);
    };
    fetchAmenities();
  }, [isOpen]);

  const visibleAmenities = showMoreAmenities
    ? amenities
    : amenities.slice(0, 6);

  const toggleAmenity = (amenityId: number) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId)
        ? prev.filter((id) => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handleClearAll = () => {
    setMinPrice(MIN_PRICE);
    setMaxPrice(MAX_PRICE);
    setSelectedAmenities([]);
  };

  const handleApply = () => {
    onApplyFilters({
      minPrice,
      maxPrice,
      selectedAmenities,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          <h2 className="text-lg font-semibold">Filters</h2>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Price Range Section */}
          <div className="pb-8 border-b border-gray-200">
            <h3 className="text-xl font-semibold mb-2">Price range</h3>
            <p className="text-gray-500 text-sm mb-6">
              The price includes all fees.
            </p>

            {/* Dual-handle Slider */}
            <div className="relative h-8 mb-6">
              {/* Track background */}
              <div className="absolute top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-300 rounded-full" />

              {/* Active track */}
              <div
                className="absolute top-1/2 -translate-y-1/2 h-0.5 bg-black rounded-full"
                style={{
                  left: `${(minPrice / MAX_PRICE) * 100}%`,
                  right: `${100 - (maxPrice / MAX_PRICE) * 100}%`,
                }}
              />

              {/* Min handle */}
              <input
                type="range"
                min={MIN_PRICE}
                max={MAX_PRICE}
                step={10}
                value={minPrice}
                onChange={(e) => {
                  const value = Math.min(
                    Number(e.target.value),
                    maxPrice - 10
                  );
                  setMinPrice(value);
                }}
                className="absolute w-full h-8 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-black [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer"
              />

              {/* Max handle */}
              <input
                type="range"
                min={MIN_PRICE}
                max={MAX_PRICE}
                step={10}
                value={maxPrice}
                onChange={(e) => {
                  const value = Math.max(
                    Number(e.target.value),
                    minPrice + 10
                  );
                  setMaxPrice(value);
                }}
                className="absolute w-full h-8 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-black [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer"
              />
            </div>

            {/* Min/Max Input Fields */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">
                  Minimum
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="text"
                    value={minPrice}
                    onChange={(e) => {
                      const value =
                        parseInt(e.target.value.replace(/\D/g, "")) || 0;
                      setMinPrice(Math.min(value, maxPrice - 10));
                    }}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-full text-center focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="text-gray-400 mt-5">—</div>

              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">
                  Maximum
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="text"
                    value={maxPrice}
                    onChange={(e) => {
                      const value =
                        parseInt(e.target.value.replace(/\D/g, "")) || 0;
                      setMaxPrice(Math.max(value, minPrice + 10));
                    }}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-full text-center focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Amenities Section */}
          <div className="py-8 border-b border-gray-200">
            <h3 className="text-xl font-semibold mb-6">Amenities</h3>

            {/* Amenity Buttons */}
            {loadingAmenities ? (
              <div className="flex flex-wrap gap-3">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-10 w-24 bg-gray-200 rounded-full animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {visibleAmenities.map((amenity) => (
                  <button
                    key={amenity.id}
                    onClick={() => toggleAmenity(amenity.id)}
                    className={`px-4 py-2 rounded-full border transition-colors ${
                      selectedAmenities.includes(amenity.id)
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-700 border-gray-300 hover:border-black"
                    }`}
                  >
                    {amenity.name}
                  </button>
                ))}
              </div>
            )}

            {/* Show More Button */}
            {amenities.length > 6 && (
              <button
                onClick={() => setShowMoreAmenities(!showMoreAmenities)}
                className="flex items-center gap-1 mt-4 text-sm font-medium underline hover:text-gray-600"
              >
                {showMoreAmenities ? (
                  <>
                    Show less <ChevronUp size={16} />
                  </>
                ) : (
                  <>
                    Show more <ChevronDown size={16} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <button
            onClick={handleClearAll}
            className="text-sm font-medium underline hover:text-gray-600"
          >
            Clear all
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-3 bg-[#328E6E] text-white rounded-lg font-medium hover:bg-[#267a5d] transition-colors"
          >
            Show {total} places
          </button>
        </div>
      </div>
    </div>
  );
}
