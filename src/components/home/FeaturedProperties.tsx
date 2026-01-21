"use client";

import FeaturedPropertyCard from "../common/FeaturedPropertyCard";
import { propertiesData } from "@/src/data/properties";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function FeaturedProperties() {
  const featuredProperties = propertiesData;
  const useCarousel = featuredProperties.length > 3;

  return (
    <section className="w-full py-16 px-6">
      <div className="mx-auto max-w-7xl">
        {/* Properties Grid or Carousel */}
        {useCarousel ? (
          <Carousel
            opts={{
              align: "start",
              loop: false,
            }}
            className="w-full"
          >
            {/* Section Title with Navigation */}
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold text-gray-900">
                  Featured Properties on our Listing
                </h2>
                <div className="mt-3 h-1 w-32 bg-gray-900"></div>
              </div>
              <div className="flex gap-2">
                <CarouselPrevious className="static translate-y-0 bg-transparent border-none text-black hover:bg-transparent hover:text-black" />
                <CarouselNext className="static translate-y-0 bg-transparent border-none text-black hover:bg-transparent hover:text-black" />
              </div>
            </div>

            <CarouselContent className="-ml-4">
              {featuredProperties.map((property) => (
                <CarouselItem
                  key={property.id}
                  className="pl-4 md:basis-1/2 lg:basis-1/3"
                >
                  <FeaturedPropertyCard property={property} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        ) : (
          <>
            {/* Section Title */}
            <div className="mb-10">
              <div>
                <h2 className="text-4xl font-bold text-gray-900">
                  Featured Properties on our Listing
                </h2>
                <div className="mt-3 h-1 w-32 bg-gray-900"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredProperties.map((property) => (
                <FeaturedPropertyCard key={property.id} property={property} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
