"use client";

import ItemCard from "../common/ItemCard";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { propertiesData } from "@/src/data/properties";

export default function LatestProperties() {
  // Sắp xếp giảm dần theo id (id lớn nhất là mới nhất)
  const latestProperties = [...propertiesData]
    .sort((a, b) => b.id - a.id)
    .slice(0, 6);

  return (
    <section className="w-full py-16 px-6">
      <div className="mx-auto max-w-7xl">
        {/* Section Title */}
        <div className="mb-10 flex justify-between items-start">
          <div>
            <h2 className="text-4xl font-bold text-[#328E6E]">
              Latest on the Property Listing
            </h2>
          </div>
        </div>

        {/* Property Carousel */}
        <Carousel
          opts={{
            align: "start",
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {latestProperties.map((property) => (
              <CarouselItem
                key={property.id}
                className="pl-4 md:basis-1/3 lg:basis-1/6"
              >
                <ItemCard
                  type={property.listing_type}
                  title={property.title}
                  address={property.address_detail ?? ""}
                  image={property.thumbnail_url}
                  rating={property.rating}
                  showRating={true}
                  price={property.price_weekday}
                  nights={property.nights}
                  isGuestFavorite={property.isGuestFavorite}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="absolute -top-16 right-0 flex gap-3">
            <CarouselPrevious className="static translate-y-0 bg-transparent border-none hover:bg-transparent text-[#328E6E] hover:text-[#67AE6E]" />
            <CarouselNext className="static translate-y-0 bg-transparent border-none hover:bg-transparent text-[#328E6E] hover:text-[#67AE6E]" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
