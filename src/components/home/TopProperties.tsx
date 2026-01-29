"use client";

import ItemCard from "../common/ItemCard";
import { useEffect, useState } from "react";
import { getTopBookedListings } from "@/src/services/listing/getLatestAndTopRatedListings";
import { ListingWithStats } from "@/src/types/listing-response";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function TopProperties() {
  const [topProperties, setTopProperties] = useState<ListingWithStats[]>([]);

  useEffect(() => {
    getTopBookedListings()
      .then((data) => {
        console.log("Top properties data:", data);
        setTopProperties(data);
      })
      .catch(() => setTopProperties([]));
  }, []);

  return (
    <section className="w-full py-16 px-6">
      <div className="mx-auto max-w-7xl">
        {/* Section Title */}
        <div className="mb-10 flex justify-between items-start">
          <div>
            <h2 className="text-4xl font-bold text-[#328E6E]">
              Top Properties
            </h2>
          </div>
        </div>

        {/* Property Carousel or Empty State */}
        {topProperties.length === 0 ? (
          <div className="text-center text-gray-400 py-10 text-lg">No top properties found.</div>
        ) : (
          <Carousel
            opts={{
              align: "start",
              loop: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {/* Log thumbnail_url cho debug */}
              {topProperties.map((property) => (
                <CarouselItem
                  key={property.id}
                  className="pl-4 md:basis-1/3 lg:basis-1/6"
                >
                  {/* Thumbnail debug log đã bị xoá để tránh lỗi cú pháp */}
                  <ItemCard
                    type={property.listing_type}
                    title={property.title}
                    address={property.address_detail ?? ""}
                    image={property.thumbnail_url ? property.thumbnail_url : "/no-image.png"}
                    rating={property.average_rating}
                    showRating={true}
                    price={undefined}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="absolute -top-16 right-0 flex gap-3">
              <CarouselPrevious className="static translate-y-0 bg-transparent border-none hover:bg-transparent text-[#328E6E] hover:text-[#67AE6E]" />
              <CarouselNext className="static translate-y-0 bg-transparent border-none hover:bg-transparent text-[#328E6E] hover:text-[#67AE6E]" />
            </div>
          </Carousel>
        )}
      </div>
    </section>
  );
}
