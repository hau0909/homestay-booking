/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { Button } from "@/components/ui/button";
import ExperienceInfoStep from "@/src/components/listing/ExperienceInfoStep";
import ExperiencePricingStep from "@/src/components/listing/ExperiencePricingStep";
import ExperienceScheduleStep from "@/src/components/listing/ExperienceScheduleStep";
import ExperienceSlotStep from "@/src/components/listing/ExperienceSlotStep";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ExperienceLocationStep from "@/src/components/listing/ExperienceLocationStep";
import { ExperienceActivity } from "@/src/types/experienceActivity";
import { ExperienceSlot } from "@/src/types/experienceSlot";
import { Profile } from "@/src/types/profile";
import { getProfile } from "@/src/services/profile/profile.service";
import { getUser } from "@/src/services/profile/getUserProfile";
import { Loader2 } from "lucide-react";
import { createDraftExperienceListing } from "@/src/services/listing/createDraftExperienceListing";
import { Listing } from "@/src/types/listing";
import { updateListing } from "@/src/services/listing/updateListing";
import { addExperienceLocation } from "@/src/services/listing/addExperienceLocation";
import { Experience } from "@/src/types/experience";
import { createExperience } from "@/src/services/experience/createExperience";
import { addExperienceActivities } from "@/src/services/experience/addExperienceActivities";
import { addExperiencePrice } from "@/src/services/experience/addExperiencePrice";
import { createExperienceSlots } from "@/src/services/experience/createExperienceSlots";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import toast from "react-hot-toast";

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [currentHost, setCurrentHost] = useState<Profile | null>(null);
  const [processing, setProcessing] = useState(false);
  const [listing, setListing] = useState<Listing | null>(null);
  const [experience, setExperience] = useState<Experience | null>(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  // step 0 - title. description
  const [basicInfo, setBasicInfo] = useState({
    title: "",
    description: "",
  });

  // step 1 - address
  const [location, setLoation] = useState<{
    address_detail: string;
    province_code: string;
    district_code: string;
    ward_code: string;
  }>({
    address_detail: "",
    province_code: "",
    district_code: "",
    ward_code: "",
  });

  // step 2 - activities
  const [activities, setActivities] = useState<ExperienceActivity[]>([]);
  const [activityFiles, setActivityFiles] = useState<Record<number, File>>({});

  const handleActivityFile = (id: number, file: File) => {
    setActivityFiles((prev) => ({
      ...prev,
      [id]: file,
    }));
  };

  // step 3 - pricing
  const [price, setPrice] = useState<number>(0);

  // step 4 - slots
  const [slots, SetSlots] = useState<ExperienceSlot[]>([]);

  // fetch current user (host)
  useEffect(() => {
    const fetchHost = async () => {
      const { user } = await getUser();

      if (!user) {
        router.back();
        return;
      }

      const profile = await getProfile(user.id);
      setCurrentHost(profile);
      setLoading(false);
    };

    fetchHost();
  }, []);

  const canNext = () => {
    switch (step) {
      case 0:
        if (!basicInfo.title || !basicInfo.description) return false;
        return true;
      case 1:
        if (
          !location.address_detail ||
          !location.district_code ||
          !location.province_code ||
          !location.ward_code
        )
          return false;
        return true;
      case 2:
        if (activities.length <= 0) return false;
        return true;
      case 3:
        if (price <= 0) return false;
        return true;
      case 4:
        if (slots.length <= 0) return false;
        return true;
    }
  };

  const handleNext = () => {
    switch (step) {
      case 0:
        handleInfo();
        break;

      case 1:
        handleLocation();
        break;

      case 2:
        handleSchedule();
        break;

      case 3:
        handlePricing();
        break;

      case 4:
        setOpenConfirmDialog(true);
        break;
      default:
        break;
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleUpdate = async (props: Partial<Listing>) => {
    if (!listing) return;
    if (step === 0) {
      try {
        const isUpdated = await updateListing(listing.id, props);
        if (isUpdated) return true;
      } catch (error) {
        console.error("Experience Listing error (handle update): ", error);
        return false;
      }
    }
  };

  const handleInfo = async () => {
    if (!basicInfo.title || !basicInfo.description || !currentHost) return;
    try {
      setProcessing(true);
      if (!listing) {
        const createdListing = await createDraftExperienceListing({
          host_id: currentHost.id,
          title: basicInfo.title,
          description: basicInfo.description,
        });

        if (createdListing) {
          setListing(createdListing);

          const createdExperience = await createExperience({
            id: createdListing.id,
            listing_id: createdListing.id,
            title: createdListing.title,
            description: createdListing.description,
            price_per_person: 0,
          });

          if (createdExperience) {
            setExperience(createdExperience);
            setStep((prev) => prev + 1);
          }
        }
      } else {
        const isUpdated = await handleUpdate({
          title: basicInfo.title,
          description: basicInfo.description,
        });

        if (isUpdated) setStep((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Experience Listing error (step 0): ", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleLocation = async () => {
    if (
      !location.address_detail ||
      !location.district_code ||
      !location.province_code ||
      !location.ward_code ||
      !currentHost ||
      !listing
    )
      return;

    try {
      setProcessing(true);

      const isAddedLocation = await addExperienceLocation(listing.id, {
        address_detail: location.address_detail,
        district_code: location.district_code,
        province_code: location.province_code,
        ward_code: location.ward_code,
      });

      if (isAddedLocation) {
        setStep((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Experience Listing error (step 1): ", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleSchedule = async () => {
    if (activities.length <= 0 || !experience) return;

    try {
      setProcessing(true);

      const insertedActivities = await addExperienceActivities(
        experience.id,
        activities,
        activityFiles,
      );

      if (insertedActivities) {
        setStep((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Experience Listing error (step 2): ", error);
    } finally {
      setProcessing(false);
    }
  };

  const handlePricing = async () => {
    if (price <= 0 || !experience) return;

    try {
      setProcessing(true);

      const isAddedPrice = await addExperiencePrice(experience.id, {
        price_per_person: price,
      });

      if (isAddedPrice) {
        setStep((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Experience Listing error (step 3): ", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleCreate = async () => {
    if (!experience || slots.length === 0 || !listing) return;

    setOpenConfirmDialog(false);

    try {
      setProcessing(true);

      const today = new Date().toISOString().split("T")[0];

      const formattedSlots = slots.map((slot) => {
        const startDateTime = `${today}T${slot.start_time}:00`;
        const endDateTime = `${today}T${slot.end_time}:00`;

        return {
          experience_id: experience.id,
          start_time: startDateTime,
          end_time: endDateTime,
          max_attendees: slot.max_attendees,
          is_active: true,
        };
      });

      const insertedSlots = await createExperienceSlots(formattedSlots);

      if (insertedSlots) {
        const isUpdated = await updateListing(listing?.id, {
          status: "ACTIVE",
        });
        if (isUpdated) {
          toast.success("Experience created successfully");
          router.push("/hosting/listing");
        }
      }
    } catch (error) {
      console.error("Experience Slot error:", error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading)
    return (
      <div>
        <Loader2
          className="animate-spin my-30 mx-auto text-teal-500"
          size={50}
        />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto mb-10 p-5 mt-6 space-y-6">
      <p className="text-3xl font-bold tracking-tight text-slate-800">
        Create Experience Listing
      </p>
      <div className="bg-white border border-slate-200 shadow-sm  rounded-2xl p-8 md:p-10">
        <div className="flex-1">
          <div className="space-y-6">
            {step === 0 && (
              <ExperienceInfoStep value={basicInfo} onChange={setBasicInfo} />
            )}

            {step === 1 && (
              <ExperienceLocationStep value={location} onChange={setLoation} />
            )}

            {step === 2 && (
              <ExperienceScheduleStep
                experienceId={experience?.id ?? 0}
                value={activities}
                onChange={setActivities}
                onFileSelect={handleActivityFile}
              />
            )}

            {step === 3 && (
              <ExperiencePricingStep value={price} onChange={setPrice} />
            )}

            {step === 4 && (
              <ExperienceSlotStep value={slots} onChange={SetSlots} />
            )}

            {/* Navigation */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                variant="outline"
                disabled={step === 0}
                onClick={handleBack}
              >
                Back
              </Button>

              <Button disabled={!canNext() || processing} onClick={handleNext}>
                <p className={`${processing && "animate-pulse"}`}>
                  {step === 4
                    ? "Create"
                    : processing
                      ? "Processing..."
                      : "Next"}
                </p>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={openConfirmDialog} onOpenChange={setOpenConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm create experience?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to create this experience listing? You
              won&apos;t be able to easily edit slots immediately after
              creation.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction onClick={handleCreate}>
              Confirm create
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
