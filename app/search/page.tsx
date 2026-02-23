"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import useEmblaCarousel from "embla-carousel-react";
import { SlidersHorizontal } from "lucide-react";
import CompactSearchBar from "@/src/components/search/CompactSearchBar";
import ListingCard from "@/src/components/search/ListingCard";
import FilterModal, { FilterState } from "@/src/components/search/FilterModal";
import SortDropdown, { SortOption } from "@/src/components/search/SortDropdown";
import {
  searchListings,
  ListingWithDetails,
} from "@/src/services/listing/searchListings";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<ListingWithDetails[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [carouselPage, setCarouselPage] = useState(1);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    minPrice: 0,
    maxPrice: 1000,
    selectedAmenities: [],
  });
  const [sortBy, setSortBy] = useState<SortOption[]>([]);

  const limit = 12;
  const itemsPerCarouselPage = 4; // Show 4 items (2 cols x 2 rows) per carousel page

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollPrev();
      setCarouselPage((p) => Math.max(1, p - 1));
    }
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollNext();
      setCarouselPage((p) =>
        Math.min(Math.ceil(listings.length / itemsPerCarouselPage), p + 1),
      );
    }
  }, [emblaApi, listings.length]);

  const scrollToPage = useCallback(
    (page: number) => {
      if (emblaApi) {
        emblaApi.scrollTo(page - 1);
        setCarouselPage(page);
      }
    },
    [emblaApi],
  );

  const provinceCode = searchParams.get("province") || undefined;
  const checkIn = searchParams.get("checkIn") || undefined;
  const checkOut = searchParams.get("checkOut") || undefined;
  const guests = searchParams.get("guests")
    ? parseInt(searchParams.get("guests")!)
    : undefined;

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        // Only apply price filter if user has modified the default values
        const shouldApplyPriceFilter =
          filters.minPrice > 0 || filters.maxPrice < 1000;

        const result = await searchListings({
          provinceCode,
          checkIn,
          checkOut,
          guests,
          minPrice: shouldApplyPriceFilter ? filters.minPrice : undefined,
          maxPrice: shouldApplyPriceFilter ? filters.maxPrice : undefined,
          amenityIds:
            filters.selectedAmenities.length > 0
              ? filters.selectedAmenities
              : undefined,
          sortBy,
          page: currentPage,
          limit,
        });
        setListings(result.listings);
        setTotal(result.total);
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [provinceCode, checkIn, checkOut, guests, currentPage, filters, sortBy]);

  const totalPages = Math.ceil(total / limit);
  const totalCarouselPages = Math.ceil(listings.length / itemsPerCarouselPage);

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Compact Search */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-[1920px] mx-auto flex items-center justify-center gap-4">
          <CompactSearchBar />

          {/* Filter Button */}
          <button
            onClick={() => setShowFilterModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full hover:shadow-md transition-shadow bg-white"
          >
            <SlidersHorizontal size={16} />
            <span className="text-sm font-medium">Filters</span>
          </button>

          {/* Sort Dropdown */}
          <SortDropdown value={sortBy} onChange={setSortBy} />
        </div>
      </header>

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        total={total}
        onApplyFilters={setFilters}
      />

      {/* Main Content */}
      <div className="flex">
        {/* Listings Section - Left */}
        <div className="w-1/2 p-6">
          {/* Results Count */}
          <p className="text-sm text-gray-600 mb-6">
            Hơn {total} nhà ở trong khu vực trên bản đồ
          </p>

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-xl mb-3" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length > 0 ? (
            <>
              {/* Listings Carousel */}
              <div className="relative mb-8">
                <div className="overflow-hidden" ref={emblaRef}>
                  <div className="flex">
                    {Array.from({ length: totalCarouselPages }).map(
                      (_, pageIdx) => (
                        <div key={pageIdx} className="flex-[0_0_100%] min-w-0">
                          <div className="grid grid-cols-2 gap-x-6 gap-y-8">
                            {listings
                              .slice(
                                pageIdx * itemsPerCarouselPage,
                                (pageIdx + 1) * itemsPerCarouselPage,
                              )
                              .map((listing) => (
                                <ListingCard
                                  key={listing.id}
                                  listing={listing}
                                />
                              ))}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                {/* Navigation Buttons */}
                {totalCarouselPages > 1 && (
                  <>
                    <button
                      onClick={scrollPrev}
                      disabled={carouselPage === 1}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-10 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <span className="text-2xl text-black font-bold">←</span>
                    </button>
                    <button
                      onClick={scrollNext}
                      disabled={carouselPage === totalCarouselPages}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-10 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <span className="text-2xl text-black font-bold">→</span>
                    </button>
                  </>
                )}
              </div>

              {/* Carousel Pagination */}
              {totalCarouselPages > 1 && (
                <div className="flex items-center justify-center gap-2 mb-8">
                  <button
                    onClick={scrollPrev}
                    disabled={carouselPage === 1}
                    className="w-10 h-10 bg-white rounded-full shadow-md hover:shadow-lg flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <span className="text-black text-lg font-bold">←</span>
                  </button>

                  {Array.from({ length: Math.min(5, totalCarouselPages) }).map(
                    (_, i) => {
                      let pageNum: number;
                      if (totalCarouselPages <= 5) {
                        pageNum = i + 1;
                      } else if (carouselPage <= 3) {
                        pageNum = i + 1;
                      } else if (carouselPage >= totalCarouselPages - 2) {
                        pageNum = totalCarouselPages - 4 + i;
                      } else {
                        pageNum = carouselPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => scrollToPage(pageNum)}
                          className={`w-10 h-10 rounded-full font-medium transition-colors ${
                            carouselPage === pageNum
                              ? "bg-black text-white"
                              : "bg-white hover:bg-gray-100 text-gray-900"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    },
                  )}

                  {totalCarouselPages > 5 &&
                    carouselPage < totalCarouselPages - 2 && (
                      <>
                        <span className="px-2 text-gray-500">...</span>
                        <button
                          onClick={() => scrollToPage(totalCarouselPages)}
                          className="w-10 h-10 rounded-full font-medium bg-white hover:bg-gray-100 text-gray-900"
                        >
                          {totalCarouselPages}
                        </button>
                      </>
                    )}

                  <button
                    onClick={scrollNext}
                    disabled={carouselPage === totalCarouselPages}
                    className="w-10 h-10 bg-white rounded-full shadow-md hover:shadow-lg flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <span className="text-black text-lg font-bold">→</span>
                  </button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12 mb-8">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ←
                  </button>

                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-full font-medium transition-colors ${
                          currentPage === pageNum
                            ? "bg-black text-white"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="px-2">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="w-10 h-10 rounded-full font-medium hover:bg-gray-100"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}

                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Không tìm thấy kết quả
              </h3>
              <p className="text-gray-500 text-center">
                Thử thay đổi bộ lọc hoặc tìm kiếm ở khu vực khác
              </p>
            </div>
          )}
        </div>

        {/* Map Section - Right (Sticky) */}
        <div className="w-1/2 h-screen sticky top-0 p-6">
          <div className="h-full bg-gray-200 rounded-2xl overflow-hidden relative">
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2">🗺️</div>
                <p className="font-medium">Map will be integrated here</p>
                <p className="text-sm mt-2">
                  Sẽ hiển thị markers với giá của từng listing
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
