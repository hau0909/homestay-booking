"use client";

import ItemCard from "../common/ItemCard";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { propertiesData } from "@/src/data/properties";

export default function LatestProperties() {
  const latestProperties = propertiesData;

  return (
    <section className="w-full py-16 px-6">
      <div className="mx-auto max-w-7xl">
        {/* Section Title */}
        <div className="mb-10 flex justify-between items-start">
          <div>
            <h2 className="text-4xl font-bold text-gray-900">
              Latest on the Property Listing
            </h2>
            <div className="mt-3 h-1 w-24 bg-gray-900"></div>
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
                className="pl-4 md:basis-1/2 lg:basis-1/4"
              >
                <ItemCard
                  type={property.type}
                  title={property.title}
                  address={property.address}
                  image={property.image}
                  avatarImage={property.avatarImage}
                  rating={property.rating}
                  showRating={false}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="absolute -top-16 right-0 flex gap-3">
            <CarouselPrevious className="static translate-y-0 bg-transparent border-none hover:bg-transparent text-black hover:text-black" />
            <CarouselNext className="static translate-y-0 bg-transparent border-none hover:bg-transparent text-black hover:text-black" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
