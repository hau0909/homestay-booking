"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Loader2,
  Users,
  FileText,
  Calendar as CalendarIcon,
  Clock,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

import { getUser } from "@/src/services/profile/getUserProfile";
import { getListingById } from "@/src/services/listing/getListingById";
import { Listing } from "@/src/types/listing";
import { getProvinceByCode } from "@/src/services/location/getProvinceByCode";
import { getDistrictByCode } from "@/src/services/location/getDistrictByCode";
import { getWardByCode } from "@/src/services/location/getWardByCode";

import { createDraftBooking } from "@/src/services/booking/createDraftBooking";
import { updateBookingDates } from "@/src/services/booking/updateBookingDates";
import { updateBookingTotalPrice } from "@/src/services/booking/updateBookingTotalPrice";
import { updateBookingNote } from "@/src/services/booking/updateBookingNote";
import { confirmBooking } from "@/src/services/booking/confirmBooking";
import { formatDateLocal } from "@/src/utils/fomartDateLocal";
import { supabase } from "@/src/lib/supabase";

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
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

import ExperienceListingSummary from "@/src/components/booking/ExperienceListingSummary";
import ExperienceBookingStep1 from "@/src/components/booking/ExperienceBookingStep1";
import ExperienceBookingStep2 from "@/src/components/booking/ExperienceBookingStep2";
import { Experience } from "@/src/types/experience";
import { ExperienceSlot } from "@/src/types/experienceSlot";

export default function ExperienceBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = Number(searchParams.get("listing"));

  const [loading, setLoading] = useState(true);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  // Data fetching state
  const [listing, setListing] = useState<Listing | null>(null);
  const [experience, setExperience] = useState<Experience | null>(null);
  const [address, setAddress] = useState("");

  // Booking Form State
  const defaultMockSlots: ExperienceSlot[] = [
    {
      id: 1,
      experience_id: 1,
      start_time: "09:00:00",
      end_time: "11:00:00",
      max_attendees: 10,
      is_active: true,
      created_at: "",
      updated_at: "",
    },
    {
      id: 2,
      experience_id: 1,
      start_time: "14:00:00",
      end_time: "16:00:00",
      max_attendees: 5,
      is_active: true,
      created_at: "",
      updated_at: "",
    },
  ];

  const [availableSlots, setAvailableSlots] =
    useState<ExperienceSlot[]>(defaultMockSlots);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [selectedSlot, setSelectedSlot] = useState<ExperienceSlot | null>(
    defaultMockSlots[0],
  );
  const [guests, setGuests] = useState(1);
  const [note, setNote] = useState("");

  // UI State
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const { user } = await getUser();
        if (!user) {
          toast.error("Please login first!");
          router.push("/");
          return;
        }

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
        }

        // Fetch Experience data using direct Supabase call as a placeholder
        const { data: expData, error: expError } = await supabase
          .from("experiences")
          .select("*")
          .eq("listing_id", listingId)
          .maybeSingle();

        if (expError) throw expError;

        // Mock experience if none found for testing UI
        const currExperience = (expData as Experience) || {
          id: 1,
          listing_id: listingId,
          title: listingData?.title || "Awesome Experience",
          description: "A great experience to join.",
          price_per_person: 50,
        };
        setExperience(currExperience);

        // Fetch Slots
        const { data: slotsData } = await supabase
          .from("experience_slots")
          .select("*")
          .eq("experience_id", currExperience.id)
          .eq("is_active", true);

        // Mock slots if empty
        const slots: ExperienceSlot[] = slotsData?.length
          ? (slotsData as ExperienceSlot[])
          : [
              {
                id: 1,
                experience_id: currExperience.id,
                start_time: "09:00:00",
                end_time: "11:00:00",
                max_attendees: 10,
                is_active: true,
                created_at: "",
                updated_at: "",
              },
              {
                id: 2,
                experience_id: currExperience.id,
                start_time: "14:00:00",
                end_time: "16:00:00",
                max_attendees: 5,
                is_active: true,
                created_at: "",
                updated_at: "",
              },
            ];

        setAvailableSlots(slots);

        // DEV FIX: Pre-select date and slot for easier testing
        setSelectedDate(new Date());
        setSelectedSlot(slots[0]);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load experience details");
      } finally {
        setLoading(false);
      }
    };

    if (listingId) {
      fetchAllData();
    }
  }, [listingId, router]);

  const canProceedToStep2 = Boolean(selectedDate && selectedSlot);
  const canConfirm = canProceedToStep2 && guests > 0;

  const handleNextStep = () => {
    if (!canProceedToStep2) {
      toast.error("Please select a date and an available time slot");
      return;
    }
    setCurrentStep(2);
  };

  const handleBackStep = () => {
    setCurrentStep(1);
  };

  const handleConfirmAction = () => {
    if (!canConfirm) {
      toast.error("Please fill in all required fields (Date, Slot, Guests)");
      return;
    }
    setOpenConfirmDialog(true);
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setOpenConfirmDialog(false);

      // Create draft booking
      const booking = await createDraftBooking(listingId);

      // Update Dates (Using selectedDate for both check-in and check-out for single day exp)
      if (selectedDate) {
        await updateBookingDates({
          booking_id: booking.id,
          check_in_date: formatDateLocal(selectedDate),
          check_out_date: formatDateLocal(selectedDate),
        });
      }

      // Update Total Price
      if (experience) {
        const totalPrice = experience.price_per_person * guests;
        await updateBookingTotalPrice({
          booking_id: booking.id,
          total_price: totalPrice,
        });
      }

      // Update Note
      if (note.trim()) {
        await updateBookingNote({ booking_id: booking.id, note: note });
      }

      // Confirm Booking
      await confirmBooking(booking.id);

      toast.success("Booking confirmed successfully!");
      // Navigate to success page (assuming same success page as homes for now)
      router.push(`/book/homes/${booking.id}/success`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to complete booking");
    } finally {
      setLoading(false);
    }
  };

  // Helper to format time nicely (e.g. 14:00:00 -> 2:00 PM)
  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(":");
      const d = new Date();
      d.setHours(parseInt(hours, 10));
      d.setMinutes(parseInt(minutes, 10));
      return format(d, "h:mm a");
    } catch {
      return timeString;
    }
  };

  if (!loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-teal-500" size={50} />
      </div>
    );
  }

  // if (!listing || !experience) return null;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 md:px-8 pb-20">
      {/* Header */}
      <div className="flex items-center gap-5 mb-10">
        <ArrowLeft
          className="p-1.5 rounded-full bg-slate-100 cursor-pointer hover:bg-slate-200 transition-colors"
          size={35}
          onClick={() => (currentStep === 2 ? handleBackStep() : router.back())}
        />
        <p className="text-4xl font-semibold text-slate-800">Request to Book</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* LEFT COLUMN - Booking Form */}
        <div className="flex-1 w-full border border-slate-200 rounded-3xl p-8 bg-white shadow-sm space-y-12">
          {currentStep === 1 && (
            <ExperienceBookingStep1
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedSlot={selectedSlot}
              setSelectedSlot={setSelectedSlot}
              availableSlots={availableSlots}
              onNext={handleNextStep}
              canProceed={canProceedToStep2}
            />
          )}

          {currentStep === 2 && (
            <ExperienceBookingStep2
              guests={guests}
              setGuests={setGuests}
              selectedSlot={selectedSlot}
              note={note}
              setNote={setNote}
              onBack={handleBackStep}
              onConfirm={handleConfirmAction}
              canConfirm={canConfirm}
            />
          )}
        </div>

        {/* RIGHT COLUMN - Summary */}
        <div className="w-full lg:w-[400px] shrink-0 sticky top-10">
          <ExperienceListingSummary
            listingId={listingId}
            title={listing?.title || "Experience"}
            address={address}
            price_per_person={experience?.price_per_person || 0}
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            guests={guests}
          />
        </div>

        {/* Confirmation Dialog */}
        <AlertDialog
          open={openConfirmDialog}
          onOpenChange={setOpenConfirmDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm booking?</AlertDialogTitle>
              <AlertDialogDescription>
                This booking will be sent to the host for confirmation. You
                won’t be able to edit the time and guest count after this step.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirm}
                className="bg-slate-800 hover:bg-slate-900"
              >
                Submit Request
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
