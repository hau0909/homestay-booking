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

// 👉 services (GIỮ NGUYÊN TÊN)

type Props = {
  data: CreateListingForm;
  onBack: () => void;
  onPublish: () => void;
};

export default function PreviewPublishStep({
  data,
  onBack,
  onPublish,
}: Props) {
  const [confirmed, setConfirmed] = useState(false);

  // location names
  const [provinceName, setProvinceName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [wardName, setWardName] = useState("");

  const images = data.images ?? [];
  const mainImage = images[0];
  const subImages = images.slice(1, 5);

  /* =======================
     LOAD LOCATION NAME
  ======================= */
  useEffect(() => {
    async function loadLocationName() {
      // Province
      if (data.province_code) {
        const provinces = await getProvinces();
        const province = provinces.find(
          (p) => p.code === data.province_code
        );
        setProvinceName(province?.name ?? "");
      }

      // District
      if (data.province_code && data.district_code) {
        const districts = await getDistrictsByProvince(
          data.province_code
        );
        const district = districts.find(
          (d) => d.code === data.district_code
        );
        setDistrictName(district?.name ?? "");
      }

      // Ward
      if (data.district_code && data.ward_code) {
        const wards = await getWardsByDistrict(
          data.district_code
        );
        const ward = wards.find(
          (w) => w.code === data.ward_code
        );
        setWardName(ward?.name ?? "");
      }
    }

    loadLocationName();
  }, [
    data.province_code,
    data.district_code,
    data.ward_code,
  ]);

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
            <div className="relative h-[340px] w-full overflow-hidden rounded-2xl">
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
              className="relative h-[160px] w-full overflow-hidden rounded-2xl"
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
        <div className="lg:col-span-3 max-w-3xl space-y-5">
          {/* ABOUT */}
          <section>
            <h2 className="text-xl font-semibold">About this place</h2>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              {data.description || "No description provided."}
            </p>
          </section>

          {/* INFO */}
          <section className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-6">
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

          {/* CONFIRM */}
          <div className="border rounded-xl px-5 py-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="confirm"
                checked={confirmed}
                onCheckedChange={(v) => setConfirmed(!!v)}
              />
              <label
                htmlFor="confirm"
                className="cursor-pointer text-sm leading-relaxed text-slate-600"
              >
                I confirm that all information and images in this listing are
                accurate and I’m ready to publish it.
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT – PRICE */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 rounded-2xl border bg-white p-8 shadow-lg space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Price per night</p>
              <p className="text-3xl font-semibold">
                ${data.price_weekday}
              </p>
              <p className="text-sm text-muted-foreground">
                Weekend: ${data.price_weekend}
              </p>
            </div>

            <Button
              className="w-full py-6 text-base"
              disabled={!confirmed}
              onClick={onPublish}
            >
              Publish listing
            </Button>

            <Button variant="outline" className="w-full" onClick={onBack}>
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
    <div className="flex items-start gap-3">
      {icon && <div className="mt-1 text-slate-500">{icon}</div>}
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value ?? "-"}</p>
      </div>
    </div>
  );
}
