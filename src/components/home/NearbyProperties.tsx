"use client";

import ItemCard from "../common/ItemCard";
import { MapPinned } from "lucide-react";
import { propertiesData } from "@/src/data/properties";

export default function NearbyProperties() {
  const nearbyProperties = propertiesData.slice(0, 6);

  return (
    <section className="w-full py-16 px-6">
      <div className="mx-auto max-w-7xl">
        {/* Section Title */}
        <div className="mb-10 flex justify-between items-start">
          <div>
            <h2 className="text-4xl font-bold text-[#328E6E]">
              Nearby Listed Properties
            </h2>
          </div>

          <button className="flex items-center gap-2 text-sm font-bold text-[#328E6E] hover:text-[#67AE6E] transition-colors mt-7 hover:cursor-pointer">
            <MapPinned size={20} />
            Show On Map
          </button>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {nearbyProperties.map((property) => (
            <ItemCard
              key={property.id}
              type={property.type}
              title={property.title}
              image={property.image}
              avatarImage={property.avatarImage}
              address={property.address}
              rating={property.rating}
              showRating={true}
              price={property.price}
              nights={property.nights}
              isGuestFavorite={property.isGuestFavorite}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
