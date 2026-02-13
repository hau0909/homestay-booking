/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Progress } from "@/components/ui/progress";

import BasicInfoStep from "@/src/components/listing/BasicInfoStep";
import LocationStep from "@/src/components/listing/LocationStep";
import DetailsStep from "@/src/components/listing/DetailsStep";
import PricingStep from "@/src/components/listing/PricingStep";
import ImagesStep from "@/src/components/listing/ImagesStep";
import PreviewPublishStep from "@/src/components/listing/PreviewPublishStep";
import AmenitiesStep from "@/src/components/listing/AmenitiesStep";



/* ===== services ===== */
import { createBasicInfo } from "@/src/services/listing/createBasicInfo";
import { saveLocation } from "@/src/services/listing/saveLocation";
import { saveDetails } from "@/src/services/listing/saveDetails";
import { uploadListingImages } from "@/src/services/listing/uploadListingImages";
import { publishListing } from "@/src/services/listing/publishListing";
import { saveAmenities } from "@/src/services/listing/saveAmenities";
import { saveFees } from "@/src/services/listing/saveFees";


import { getUser } from "@/src/services/profile/getUserProfile"; 
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ExtraFeesStep from "@/src/components/listing/ExtraFeesStep";

/* =======================
   TYPE
======================= */
export type CreateListingForm = {
  title: string;
  description: string;
  listing_type: "HOME";

  address_detail: string;
  province_code: string;
  district_code: string;
  ward_code: string;

  quantity: number;
  max_guests: number;
  bed_count: number;
  bath_count: number;
  room_size: number;

  price_weekday: number;
  price_weekend: number;

  images: File[];
  amenity_ids: number[];
  fees: {
    title: string;
    price: number;
  }[];
 
};

const steps = [
  "Basic Info",
  "Location",
  "Details",
  "Amenities",
  "Extra Fees",
  "Pricing",
  "Images",
  "Preview",
];

export default function CreateListingPage() {      
  const [step, setStep] = useState(0);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState<CreateListingForm>({
    title: "",
    description: "",
    listing_type: "HOME",

    address_detail: "",
    province_code: "",
    district_code: "",
    ward_code: "",

    quantity: 1,
    max_guests: 1,
    bed_count: 0,
    bath_count: 0,
    room_size: 20,

    price_weekday: 0,
    price_weekend: 0,

    images: [],
    amenity_ids: [],
    fees: [],
  });

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1)); 
  const back = () => setStep((s) => Math.max(s - 1, 0));

  /* =======================
     PUBLISH
  ======================= */
  const handlePublish = async () => {
    try {
      setLoading(true);

      const { user } = await getUser();
      if (!user) throw new Error("User not authenticated");

      /* BASIC INFO */
      const listing = await createBasicInfo({
        host_id: user.id,
        category_id: 1,
        title: data.title,
        description: data.description,
        listing_type: data.listing_type,
      });

      /* LOCATION */
      await saveLocation(listing.id, {
        province_code: data.province_code,
        district_code: data.district_code,
        ward_code: data.ward_code,
        address_detail: data.address_detail,
      });

      /* HOME DETAILS */
      await saveDetails(listing.id, {
        quantity: data.quantity,
        max_guests: data.max_guests,
        bed_count: data.bed_count,
        bath_count: data.bath_count,
        room_size: data.room_size,
        price_weekday: data.price_weekday,
        price_weekend: data.price_weekend,
      });
      await saveAmenities(listing.id, data.amenity_ids);
      await saveFees(listing.id, data.fees); 

      /* IMAGES */
      await uploadListingImages(listing.id, data.images);

      /* PUBLISH */
      await publishListing(listing.id);

      toast.success("Listing created successfully!");
      router.push("/hosting/listing");
    } catch (err: any) {
      console.error("CREATE LISTING FAILED:", err);
      alert(err.message || "Create listing failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Create Listing</h1>

      <Progress value={((step + 1) / steps.length) * 100} />   

      {step === 0 && (
        <BasicInfoStep data={data} onChange={setData} onNext={next} />   //cho component con nhận data, cho conpoment con sửa data
      )}

      {step === 1 && (
        <LocationStep
          data={data}
          onChange={setData}
          onNext={next}
          onBack={back}
        />
      )}

      {step === 2 && (
        <DetailsStep
          data={data}
          onChange={setData}
          onNext={next}
          onBack={back}
        />
      )}
      {step === 3 && (
  <AmenitiesStep
    data={data}
    onChange={setData}
    onNext={next}
    onBack={back}
  />
)}
{step === 4 && (
  <ExtraFeesStep
    data={data}
    onChange={setData}
    onNext={next}
    onBack={back}
  />
)}


      {step === 5 && (
        <PricingStep
          data={data}
          onChange={setData}
          onNext={next}
          onBack={back}
        />
      )}

      {step === 6 && (
        <ImagesStep
          data={data}
          onChange={setData}
          onNext={next}
          onBack={back}
        />
      )}

      {step === 7 && (
        <PreviewPublishStep
          data={data}
          onBack={back}
          onPublish={handlePublish}
           loading={loading}
          
        />
      )}
    </div>
  );
}
