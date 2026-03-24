"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getExperience } from "@/src/services/experience/getExperience";
import { getListingImagesForEdit } from "@/src/services/listing/getListingImagesForEdit";
import { getProvinces } from "@/src/services/listing/getProvince";
import { getDistrictsByProvince } from "@/src/services/listing/getDistrict";
import { Listing } from "@/src/types/listing";
import { ListingStatus } from "@/src/types/enums";

interface Props {
  listing: Listing;
  index: number;
}

export default function ExperienceCard({ listing, index }: Props) {
  const router = useRouter();

  const [price, setPrice] = useState<number | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [provinceName, setProvinceName] = useState("");
  const [districtName, setDistrictName] = useState("");

  useEffect(() => {
    load();
    loadLocation();
  }, [listing.id]);

  const load = async () => {
    const exp = await getExperience(listing.id);
    const images = await getListingImagesForEdit(listing.id);

    if (exp) {
      setPrice(exp.price_per_person);
      setTitle(exp.title);
    }

    if (images?.length) {
      setImage(images[0].url);
    }
  };

  const loadLocation = async () => {
    if (!listing.province_code) return;
    try {
      const provinces = await getProvinces();
      const province = provinces.find((p) => p.code === listing.province_code);
      setProvinceName(province?.name || "");

      if (listing.district_code) {
        const districts = await getDistrictsByProvince(listing.province_code);
        const district = districts.find(
          (d) => d.code === listing.district_code,
        );
        setDistrictName(district?.name || "");
      }
    } catch (err) {
      console.error("Load location error:", err);
    }
  };

  const statusMap: Record<ListingStatus, { label: string; class: string }> = {
    DRAFT: { label: "Draft", class: "bg-gray-100 text-gray-700" },
    PENDING: { label: "Pending", class: "bg-yellow-100 text-yellow-700" },
    ACTIVE: { label: "Active", class: "bg-green-100 text-green-700" },
    HIDDEN: { label: "Hidden", class: "bg-indigo-100 text-indigo-700" },
    REJECTED: { label: "Rejected", class: "bg-red-100 text-red-700" },
    BANNED: { label: "Banned", class: "bg-black text-white" },
  };

  const status = (listing.status || "DRAFT").toUpperCase() as ListingStatus;

  const handleClick = () => {
    const readonly = status === "BANNED" || status === "REJECTED";

    const params = new URLSearchParams();
    if (readonly) params.set("readonly", "true");

    router.push(
      `/hosting/listing/experience/edit/${listing.id}?${params.toString()}`,
    );
  };

  const formattedDate = new Date(listing.created_at).toLocaleDateString(
    "en-US",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );

  return (
    <div
      onClick={handleClick}
      className={`
        group relative
        grid grid-cols-[50px_110px_1.6fr_1.3fr_130px_150px_120px]
        items-center
        px-8 py-5
        bg-white
        hover:bg-gray-50
        hover:shadow-sm
        transition-all
        duration-200
        cursor-pointer
        border-b
        ${status === "REJECTED" || status === "BANNED" ? "opacity-80" : ""}
      `}
    >
      <div className="text-sm text-gray-400">{index + 1}</div>

      <div>
        {image ? (
          <img
            src={image}
            className="w-24 h-16 object-cover rounded-xl shadow-sm"
          />
        ) : (
          <div className="w-24 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-xs text-gray-400">
            No Image
          </div>
        )}
      </div>

      <div className="font-semibold text-gray-900 truncate">
        {title || listing.title}
      </div>

      <div className="text-sm text-gray-500 truncate">
        {districtName && provinceName
          ? `${districtName}, ${provinceName}`
          : "-"}
      </div>

      <div className="text-sm font-semibold text-gray-900 truncate">
        {price
          ? price.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })
          : "-"}
      </div>

      <div className="text-sm text-gray-500">{formattedDate}</div>

      <div>
        <span
          className={`px-3 py-1 text-xs rounded-full font-medium ${statusMap[status].class}`}
        >
          {statusMap[status].label}
        </span>
      </div>

      <div
        className="
          absolute right-6
          text-gray-400 text-lg
          opacity-0
          translate-x-2
          group-hover:opacity-100
          group-hover:translate-x-0
          transition-all
          duration-200
        "
      >
        ›
      </div>
    </div>
  );
}
