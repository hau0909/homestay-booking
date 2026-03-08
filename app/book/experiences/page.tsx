"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

import { getUser, getUserProfile } from "@/src/services/profile/getUserProfile";
import { getListingById } from "@/src/services/listing/getListingById";
import { updateProfile } from "@/src/services/profile/updateProfile";
import { getProvinceByCode } from "@/src/services/location/getProvinceByCode";
import { getDistrictByCode } from "@/src/services/location/getDistrictByCode";
import { getWardByCode } from "@/src/services/location/getWardByCode";

import { getExperience } from "@/src/services/experience/getExperience";
import { getExperienceSlots } from "@/src/services/experience/getExperienceSlots";

import { createDraftBooking } from "@/src/services/booking/createDraftBooking";
import { updateBookingDates } from "@/src/services/booking/updateBookingDates";
import { updateBookingTotalPrice } from "@/src/services/booking/updateBookingTotalPrice";
import { updateBookingNote } from "@/src/services/booking/updateBookingNote";
import { confirmBooking } from "@/src/services/booking/confirmBooking";
import { formatDateLocal } from "@/src/utils/fomartDateLocal";
import { supabase } from "@/src/lib/supabase";
import { Listing } from "@/src/types/listing";

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
import { isValidEmail, isValidPhone } from "@/src/utils/validGuestInfo";

import ExperienceListingSummary from "@/src/components/booking/ExperienceListingSummary";
import ExperienceGuestInfo from "@/src/components/booking/ExperienceGuestInfo";
import ExperienceSlotBooking, {
  AvailableExperienceSlot,
} from "@/src/components/booking/ExperienceSlotBooking";
import ExperienceGuestQuantityAndNote from "@/src/components/booking/ExperienceGuestQuantityAndNote";
import { Experience } from "@/src/types/experience";
import { ExperienceSlot } from "@/src/types/experienceSlot";
import { getExperienceSlotGuestCount } from "@/src/services/booking/getExperienceSlotGuestCount";

const STEPS = ["Guest Info", "Date & Slot", "Quantity & Note"];

export default function ExperienceBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = Number(searchParams.get("listing"));

  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [bookingId, setBookingId] = useState<number | null>(null);

  // Data fetching state
  const [listing, setListing] = useState<Listing | null>(null);
  const [experience, setExperience] = useState<Experience | null>(null);
  const [address, setAddress] = useState("");

  // Profile State
  const [profileOrigin, setProfileOrigin] = useState<{
    userId?: string;
    fullname?: string;
    email?: string;
    phone?: string;
  } | null>(null);

  const [guest, setGuest] = useState({
    fullname: "",
    email: "",
    phone: "",
  });

  // Booking Form State
  const [availableSlots, setAvailableSlots] = useState<
    AvailableExperienceSlot[]
  >([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [selectedSlot, setSelectedSlot] =
    useState<AvailableExperienceSlot | null>(null);
  const [guests, setGuests] = useState(1);
  const [note, setNote] = useState("");

  const progress = ((step + 1) / STEPS.length) * 100;

  const canNext = () => {
    switch (step) {
      case 0:
        return (
          guest.fullname.trim() !== "" &&
          isValidEmail(guest.email) &&
          isValidPhone(guest.phone)
        );
      case 1:
        return Boolean(selectedDate && selectedSlot);
      case 2:
        return guests > 0;
      default:
        return true;
    }
  };

  const getProfilePayload = () => {
    if (!profileOrigin) return null;

    const payload: Record<string, string> = {};

    if (guest.fullname !== profileOrigin.fullname) {
      payload.full_name = guest.fullname;
    }

    if (guest.email !== profileOrigin.email) {
      payload.email = guest.email;
    }

    if (guest.phone !== profileOrigin.phone) {
      payload.phone = guest.phone;
    }

    return Object.keys(payload).length > 0 ? payload : null;
  };

  const handleNext = async () => {
    if (!canNext()) return;

    // STEP 0 — update profile + create draft booking
    if (step === 0) {
      const payload = getProfilePayload();

      if (payload) {
        try {
          await updateProfile(payload);
        } catch (err) {
          toast.error("Failed to update profile");
          console.error("Update profile failed:", err);
          return;
        }
      }

      try {
        const booking = await createDraftBooking(listingId);
        setBookingId(booking.id);
      } catch (err) {
        toast.error("Failed to create draft booking");
        console.error("Create booking failed:", err);
        return;
      }
    }

    // STEP 1 — update dates
    if (step === 1) {
      if (!bookingId) {
        toast.error("Booking not found");
        return;
      }

      if (!selectedDate || !selectedSlot) {
        toast.error("Please select date and slot");
        return;
      }

      try {
        await updateBookingDates({
          booking_id: bookingId,
          check_in_date: formatDateLocal(selectedDate),
          check_out_date: formatDateLocal(selectedDate),
          experience_slot_id: selectedSlot.id,
        });
      } catch (err) {
        toast.error("Failed to update booking dates");
        console.error("Update booking dates failed:", err);
        return;
      }
    }

    // STEP 2 — update total price & note, then confirm
    if (step === 2) {
      try {
        if (!bookingId) {
          toast.error("Booking not found");
          return;
        }

        if (!experience) {
          toast.error("Experience not found");
          return;
        }

        const totalPrice = experience.price_per_person * guests;

        await updateBookingTotalPrice({
          booking_id: bookingId,
          total_price: totalPrice,
          total_guests: guests,
        });

        if (note.trim()) {
          await updateBookingNote({ booking_id: bookingId, note: note });
        }

        setOpenConfirmDialog(true);
      } catch (err) {
        toast.error("Failed to update booking details");
        console.error("Update booking details failed:", err);
        return;
      }
      return; // Stop here, dialog opens
    }

    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 0));
  };

  useEffect(() => {
    // user info
    const fetchUserInfo = async () => {
      const { user } = await getUser();

      if (user) {
        const profile = await getUserProfile(user.id);

        if (profile) {
          const origin = {
            userId: profile.id,
            fullname: profile.full_name ?? "",
            email: profile.email ?? "",
            phone: profile.phone ?? "",
          };

          setProfileOrigin(origin);
          setGuest(origin);
        }
      } else {
        toast.error("Please login first !");
        router.push("/");
        throw new Error("Fetch user failed, please login again!");
      }
    };

    // listing info
    const fetchListingInfo = async () => {
      const listingData = await getListingById(listingId.toString());

      if (listingData) {
        setListing(listingData);
        if (
          listingData.province_code &&
          listingData.district_code &&
          listingData.ward_code
        ) {
          const province = await getProvinceByCode(listingData.province_code);
          const district = await getDistrictByCode(listingData.district_code);
          const ward = await getWardByCode(listingData.ward_code);

          if (province && district && ward && listingData.address_detail) {
            const fullAddress = [
              listingData.address_detail,
              ward.full_name ?? ward.name,
              district.full_name ?? district.name,
              province.full_name ?? province.name,
            ]
              .filter(Boolean)
              .join(", ");

            setAddress(fullAddress);
          }
        }
      } else {
        toast.error("Failed to get listing!");
        router.back();
        throw new Error("Fetch Listing failed, please try again!");
      }
      return listingData;
    };

    // experience info
    const fetchExperienceInfo = async () => {
      const expData = await getExperience(listingId);

      if (!expData) {
        toast.error("Experience details not found!");
        router.back();
        throw new Error("Fetch Experience failed!");
      }

      setExperience(expData);

      // Fetch Slots
      const slots = await getExperienceSlots(expData.id);

      // Add dynamic guests calculated
      const currentDateStr = formatDateLocal(new Date());
      const slotsInfo: AvailableExperienceSlot[] = await Promise.all(
        slots.map(async (slot) => {
          const bookedGuests = await getExperienceSlotGuestCount(
            slot.id,
            currentDateStr,
          );
          return {
            ...slot,
            available_guests: Math.max(0, slot.max_attendees - bookedGuests),
          };
        }),
      );

      setAvailableSlots(slotsInfo);

      if (slotsInfo.length > 0) {
        const validSlot = slotsInfo.find((s) => s.available_guests > 0) || null;
        setSelectedSlot(validSlot);
      }
      setSelectedDate(new Date());
    };

    const run = async () => {
      try {
        await Promise.all([
          fetchUserInfo(),
          fetchListingInfo(),
          fetchExperienceInfo(),
        ]);
      } catch (error) {
        console.error("booking error (fetch): ", error);
      } finally {
        setLoading(false);
      }
    };

    if (listingId) {
      run();
    }
  }, [listingId, router]);

  // Handle refetching slots when selectedDate changes (after initial load)
  useEffect(() => {
    if (!experience || !selectedDate) return;

    const fetchSlotsForDate = async () => {
      // setLoading(true); // Optionally show a loader, though let's keep it seamless for now
      try {
        const slots = await getExperienceSlots(experience.id);
        const dateStr = formatDateLocal(selectedDate);

        const slotsInfo: AvailableExperienceSlot[] = await Promise.all(
          slots.map(async (slot) => {
            const bookedGuests = await getExperienceSlotGuestCount(
              slot.id,
              dateStr,
            );
            return {
              ...slot,
              available_guests: Math.max(0, slot.max_attendees - bookedGuests),
            };
          }),
        );

        setAvailableSlots(slotsInfo);
        if (slotsInfo.length > 0) {
          const validSlot =
            slotsInfo.find((s) => s.available_guests > 0) || null;
          setSelectedSlot(validSlot);
        } else {
          setSelectedSlot(null);
        }
      } catch (err) {
        console.error("Fetch dynamic slots failed:", err);
      }
    };

    fetchSlotsForDate();
  }, [selectedDate, experience]);

  const handleConfirm = async () => {
    try {
      if (!bookingId) return;

      // confirm booking
      await confirmBooking(bookingId);
      toast.success("Booking confirmed successfully");

      setLoading(true);
      setOpenConfirmDialog(false);

      router.push(`/book/experiences/${bookingId}/success`);
    } catch (err) {
      toast.error("Failed to confirm booking");
      console.error(err);
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

  if (listing && experience)
    return (
      <div className="bg-white py-10 px-40 pb-20">
        {/* Header */}
        <div className="flex items-center gap-5 mb-8">
          <ArrowLeft
            className="p-1.5 rounded-full bg-slate-100 cursor-pointer hover:bg-slate-200 transition-colors"
            size={35}
            onClick={() => router.back()}
          />
          <p className="text-4xl font-semibold">Request to Book</p>
        </div>

        {/* Progress */}
        <Progress value={progress} className="mb-10" />

        <div className="flex gap-10 items-start">
          {/* LEFT */}
          <div className="flex-1 w-full border border-slate-200 rounded-2xl p-6 bg-white shadow-sm">
            <div className="space-y-6">
              {step === 0 && (
                <ExperienceGuestInfo
                  guest={guest}
                  setGuest={setGuest}
                  onNext={handleNext}
                  canProceed={canNext()}
                />
              )}

              {step === 1 && (
                <ExperienceSlotBooking
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  selectedSlot={selectedSlot}
                  setSelectedSlot={setSelectedSlot}
                  availableSlots={availableSlots}
                  onNext={handleNext}
                  onBack={handleBack}
                  canProceed={canNext()}
                />
              )}

              {step === 2 && (
                <ExperienceGuestQuantityAndNote
                  guests={guests}
                  setGuests={setGuests}
                  selectedSlot={selectedSlot}
                  note={note}
                  setNote={setNote}
                  onBack={handleBack}
                  onConfirm={handleNext}
                  canConfirm={canNext()}
                />
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="w-1/3 sticky top-10 h-fit self-start">
            <ExperienceListingSummary
              listingId={listingId}
              title={listing.title || "Experience"}
              address={address}
              price_per_person={experience.price_per_person || 0}
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              guests={guests}
            />
          </div>

          <AlertDialog
            open={openConfirmDialog}
            onOpenChange={setOpenConfirmDialog}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm booking?</AlertDialogTitle>
                <AlertDialogDescription>
                  This booking will be sent to the host for confirmation. You
                  won’t be able to edit the time and guest count after this
                  step.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>

                <AlertDialogAction onClick={handleConfirm}>
                  Submit Request
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    );
}
