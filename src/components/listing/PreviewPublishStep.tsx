"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Users, Bed, Bath, Ruler } from "lucide-react";

import type { CreateListingForm } from "@/app/hosting/listing/create/page";

import { getProvinces } from "@/src/services/listing/getProvince";
import { getDistrictsByProvince } from "@/src/services/listing/getDistrict";
import { getWardsByDistrict } from "@/src/services/listing/getWard";
import { getAmenities } from "@/src/services/listing/getAmenities";
import { Amenity } from "@/src/types/amenity";

type Props = {
  data: CreateListingForm;
  onBack: () => void;
  onPublish: () => void;
  loading: boolean;
};

export default function PreviewPublishStep({
  data,
  onBack,
  onPublish,
  loading,
}: Props) {
  const [confirmed, setConfirmed] = useState(false);

  /* ===== LOCATION ===== */
  const [provinceName, setProvinceName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [wardName, setWardName] = useState("");

  /* ===== AMENITIES ===== */
  const [amenities, setAmenities] = useState<Amenity[]>([]);

  const images = data.images ?? [];
  const mainImage = images[0];
  const subImages = images.slice(1, 5);

  /* =======================
     LOAD LOCATION NAME
  ======================= */
  useEffect(() => {
    async function loadLocationName() {
      if (data.province_code) {
        const provinces = await getProvinces();
        setProvinceName(
          provinces.find((p) => p.code === data.province_code)?.name ?? ""
        );
      }

      if (data.province_code && data.district_code) {
        const districts = await getDistrictsByProvince(data.province_code);
        setDistrictName(
          districts.find((d) => d.code === data.district_code)?.name ?? ""
        );
      }

      if (data.district_code && data.ward_code) {
        const wards = await getWardsByDistrict(data.district_code);
        setWardName(
          wards.find((w) => w.code === data.ward_code)?.name ?? ""
        );
      }
    }

    loadLocationName();
  }, [data.province_code, data.district_code, data.ward_code]);

  /* =======================
     LOAD AMENITIES
  ======================= */
  useEffect(() => {
    async function fetchAmenities() {
      const res = await getAmenities();
      setAmenities(res);
    }

    fetchAmenities();
  }, []);

  const selectedAmenities = amenities.filter((a) =>
    data.amenity_ids.includes(a.id)
  );

  return (
    <div className="space-y-10">
      {/* TITLE + ADDRESS */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">{data.title}</h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <p>
            {data.address_detail}, {wardName}, {districtName}, {provinceName}
          </p>
        </div>
      </div>

      {/* IMAGE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {mainImage && (
          <div className="md:col-span-3">
            <div className="relative h-[340px] rounded-2xl overflow-hidden">
              <Image
                src={URL.createObjectURL(mainImage)}
                alt="Main"
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          {subImages.map((img, i) => (
            <div
              key={i}
              className="relative h-[160px] rounded-2xl overflow-hidden"
            >
              <Image
                src={URL.createObjectURL(img)}
                alt={`Sub ${i}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* LEFT */}
        <div className="lg:col-span-3 space-y-8">
          {/* ABOUT */}
          <section>
            <h2 className="text-xl font-semibold">About this place</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              {data.description || "No description provided."}
            </p>
          </section>

          {/* INFO */}
          <section className="grid grid-cols-2 md:grid-cols-3 gap-y-6">
            <Info icon={<Users />} label="Guests" value={data.max_guests} />
            <Info icon={<Bed />} label="Beds" value={data.bed_count} />
            <Info icon={<Bath />} label="Baths" value={data.bath_count} />
            <Info
              icon={<Ruler />}
              label="Room size"
              value={`${data.room_size} m²`}
            />
            <Info label="Quantity" value={data.quantity} />
          </section>

          {/* AMENITIES */}
{selectedAmenities.length > 0 && (
  <section>
    <h2 className="text-xl font-semibold">Amenities</h2>

    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
      {selectedAmenities.map((a) => (
        <div
          key={a.id}
          className="flex items-center gap-3 text-sm text-slate-700"
        >
          {a.icon_url ? (
            <img
              src={a.icon_url}
              alt={a.name}
              className="w-5 h-5 object-contain"
            />
          ) : (
            <div className="w-5 h-5 rounded bg-gray-300" />
          )}

          <span>{a.name}</span>
        </div>
      ))}
    </div>
  </section>
)}


          {/* CONFIRM */}
          <div className="border rounded-xl px-5 py-4">
            <div className="flex gap-3">
              <Checkbox
                id="confirm"
                checked={confirmed}
                onCheckedChange={(v) => setConfirmed(!!v)}
              />
              <label
                htmlFor="confirm"
                className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
              >
                I confirm that all information and images are accurate and ready
                to be published.
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT – PRICE */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 rounded-2xl border bg-white p-8 shadow-lg space-y-6">
            <div>
              <p className="text-sm text-muted-foreground">Price per night</p>
              <p className="text-3xl font-semibold">${data.price_weekday}</p>
              <p className="text-sm text-muted-foreground">
                Weekend: ${data.price_weekend}
              </p>
            </div>

            {/* EXTRA FEES */}
            {data.fees.length > 0 && (
              <div className="pt-4 border-t space-y-2">
                <p className="text-sm font-medium">Extra fees</p>
                {data.fees.map((fee, index) => (
                  <div
                    key={index}
                    className="flex justify-between text-sm text-muted-foreground"
                  >
                    <span>{fee.title}</span>
                    <span>${fee.price}</span>
                  </div>
                ))}
              </div>
            )}

         <Button
  className="w-full py-6 text-base"
  disabled={!confirmed || loading}
  onClick={onPublish}
>
  {loading ? "Publishing..." : "Publish listing"}
</Button>


            <Button
  variant="outline"
  className="w-full"
  onClick={onBack}
  disabled={loading}
>
  Back
</Button>

          </div>
        </div>
      </div>
    </div>
  );
}

/* =======================
   INFO ITEM
======================= */
function Info({
  label,
  value,
  icon,
}: {
  label: string;
  value: any;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      {icon && <div className="text-slate-500 mt-1">{icon}</div>}
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value ?? "-"}</p>
      </div>
    </div>
  );
}
