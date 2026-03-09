"use client";

import { useEffect, useState } from "react";
import { Listing } from "@/src/types/listing";
import { getExperience } from "@/src/services/experience/getExperience";
import { getListingImagesForEdit } from "@/src/services/listing/getListingImagesForEdit";
import Link from "next/link";

export default function ExperienceCard({ listing }: { listing: Listing }) {
  const [price, setPrice] = useState<number | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, [listing.id]);

  const load = async () => {
    const exp = await getExperience(listing.id);
    const images = await getListingImagesForEdit(listing.id);

    if (exp) {
      setPrice(exp.price_per_person);
      setTitle(exp.title);
    }

    if (images?.length) setImage(images[0].url);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition flex flex-col h-full overflow-hidden border">
      {/* IMAGE */}
      {image ? (
        <img src={image} className="w-full h-44 object-cover" />
      ) : (
        <div className="w-full h-44 bg-gray-200 flex items-center justify-center text-gray-400">
          No Image
        </div>
      )}

      <div className="p-4 flex flex-col flex-1 gap-2.5">
        {/* TITLE */}
        <h2 className="text-lg font-semibold text-gray-800 leading-tight">
          {title}
        </h2>

        {/* ADDRESS */}
        <p className="text-sm text-gray-500 flex items-center gap-1">
          <span>📍</span>
          <span className="line-clamp-1">{listing.address_detail}</span>
        </p>

        {/* PRICE + TYPE */}
        <div className="flex justify-between items-center">
          {price && (
            <div className="text-base font-semibold text-gray-900">
              ${price}
              <span className="text-gray-500 text-sm font-normal">
                {" "}
                / person
              </span>
            </div>
          )}

          <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md">
            Experience
          </span>
        </div>

        {/* BUTTON */}
        <Link
          href={`/hosting/listing/experience/edit/${listing.id}`}
          className="mt-auto w-full text-center text-sm px-4 py-2 bg-[#2ba3cb] text-white rounded-lg hover:bg-[#1e8fb2] transition"
        >
          Edit
        </Link>
      </div>
    </div>
  );
}
