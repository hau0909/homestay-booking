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
import ExtraFeesStep from "@/src/components/listing/ExtraFeesStep";
import HouseRulesStep from "@/src/components/listing/HouseRulesStep";

/* ===== services ===== */
import { createBasicInfo } from "@/src/services/listing/createBasicInfo";
import { saveLocation } from "@/src/services/listing/saveLocation";
import { saveDetails } from "@/src/services/listing/saveDetails";
import { uploadListingImages } from "@/src/services/listing/uploadListingImages";
import { publishListing } from "@/src/services/listing/publishListing";
import { saveAmenities } from "@/src/services/listing/saveAmenities";
import { saveRulesFromText } from "@/src/services/listing/saveRules";
import { saveFees } from "@/src/services/listing/saveFees";
import { updateListing } from "@/src/services/listing/updateListing";
import { getUser } from "@/src/services/profile/getUserProfile";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

/* =======================
   TYPE
======================= */
export type CreateListingForm = {
  id?: number;
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
  rule_ids: number[]; // dùng khi save
  rules: string[]; // dùng cho UI nhập tay
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
  "House Rules",
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
    rule_ids: [],
    rules: [],
    fees: [],
  });

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  /* =======================
     HANDLERS
  ======================= */
  const handleNextBasicInfo = async () => {
    try {
      setLoading(true);
      if (!data.id) {
        const { user } = await getUser();
        if (!user) throw new Error("User not authenticated");

        const listing = await createBasicInfo({
          host_id: user.id,
          category_id: 1,
          title: data.title,
          description: data.description,
          listing_type: data.listing_type,
        });
        setData((prev) => ({ ...prev, id: listing.id }));
      } else {
        await updateListing(data.id, {
          title: data.title,
          description: data.description,
          listing_type: data.listing_type,
        });
      }
      next();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save Basic Info");
    } finally {
      setLoading(false);
    }
  };

  const handleNextLocation = async () => {
    try {
      setLoading(true);
      if (data.id) {
        await saveLocation(data.id, {
          province_code: data.province_code,
          district_code: data.district_code,
          ward_code: data.ward_code,
          address_detail: data.address_detail,
        });
      }
      next();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save Location");
    } finally {
      setLoading(false);
    }
  };

  const handleNextDetails = async () => {
    try {
      setLoading(true);
      if (data.id) {
        await saveDetails(data.id, {
          quantity: data.quantity,
          max_guests: data.max_guests,
          bed_count: data.bed_count,
          bath_count: data.bath_count,
          room_size: data.room_size,
          price_weekday: data.price_weekday,
          price_weekend: data.price_weekend,
        });
      }
      next();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save Details");
    } finally {
      setLoading(false);
    }
  };

  const handleNextAmenities = async () => {
    try {
      setLoading(true);
      if (data.id) {
        await saveAmenities(data.id, data.amenity_ids);
      }
      next();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save Amenities");
    } finally {
      setLoading(false);
    }
  };

  const handleNextHouseRules = async () => {
    try {
      setLoading(true);
      if (data.id) {
        await saveRulesFromText(data.id, data.rules);
      }
      next();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save Rules");
    } finally {
      setLoading(false);
    }
  };

  const handleNextExtraFees = async () => {
    try {
      setLoading(true);
      if (data.id) {
        await saveFees(data.id, data.fees);
      }
      next();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save Fees");
    } finally {
      setLoading(false);
    }
  };

  const handleNextPricing = async () => {
    try {
      setLoading(true);
      if (data.id) {
        await saveDetails(data.id, {
          quantity: data.quantity,
          max_guests: data.max_guests,
          bed_count: data.bed_count,
          bath_count: data.bath_count,
          room_size: data.room_size,
          price_weekday: data.price_weekday,
          price_weekend: data.price_weekend,
        });
      }
      next();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save Pricing");
    } finally {
      setLoading(false);
    }
  };

  const handleNextImages = async () => {
    try {
      setLoading(true);
      if (data.id) {
        await uploadListingImages(data.id, data.images);
      }
      next();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to upload Images");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      setLoading(true);
      if (!data.id) throw new Error("No draft listing found");
      
      await publishListing(data.id);
      
      toast.success("Listing created successfully!");
      router.push("/hosting/listing");
    } catch (err: any) {
      console.error("PUBLISH LISTING FAILED:", err);
      toast.error(err.message || "Publish listing failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Create Listing</h1>

      <Progress value={((step + 1) / steps.length) * 100} />

      {step === 0 && (
        <BasicInfoStep data={data} onChange={setData} onNext={handleNextBasicInfo} />
      )}

      {step === 1 && (
        <LocationStep
          data={data}
          onChange={setData}
          onNext={handleNextLocation}
          onBack={back}
        />
      )}

      {step === 2 && (
        <DetailsStep
          data={data}
          onChange={setData}
          onNext={handleNextDetails}
          onBack={back}
        />
      )}
      {step === 3 && (
        <AmenitiesStep
          data={data}
          onChange={setData}
          onNext={handleNextAmenities}
          onBack={back}
        />
      )}
      {step === 4 && (
        <HouseRulesStep
          data={data}
          onChange={setData}
          onNext={handleNextHouseRules}
          onBack={back}
        />
      )}
      {step === 5 && (
        <ExtraFeesStep
          data={data}
          onChange={setData}
          onNext={handleNextExtraFees}
          onBack={back}
        />
      )}

      {step === 6 && (
        <PricingStep
          data={data}
          onChange={setData}
          onNext={handleNextPricing}
          onBack={back}
        />
      )}

      {step === 7 && (
        <ImagesStep
          data={data}
          onChange={setData}
          onNext={handleNextImages}
          onBack={back}
        />
      )}

      {step === 8 && (
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
