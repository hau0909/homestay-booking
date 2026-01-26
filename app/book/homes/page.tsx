"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import GuestInfo from "@/src/components/booking/GuestInfo";
import CalendarStep from "@/src/components/booking/CalendarStep";
import PricingStep from "@/src/components/booking/PricingStep";
import NoteStep from "@/src/components/booking/NoteStep";
import ListingSummary from "@/src/components/booking/ListingSumary";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { getUser, getUserProfile } from "@/src/services/profile/getUserProfile";
import { getListingById } from "@/src/services/listing/getListingById";
import { Listing } from "@/src/types/listing";
import { updateProfile } from "@/src/services/profile/updateProfile";
import { getListingCalendar } from "@/src/services/listing/getListingCalendar";
import { DateRange } from "react-day-picker";
import { getHomeByListingId } from "@/src/services/home/getHomeByListingId";
import { Home } from "@/src/types/home";
import { getProvinceByCode } from "@/src/services/location/getProvinceByCode";
import { getDistrictByCode } from "@/src/services/location/getDistrictByCode";
import { getWardByCode } from "@/src/services/location/getWardByCode";
import { createDraftBooking } from "@/src/services/booking/createDraftBooking";
import { updateBookingDates } from "@/src/services/booking/updateBookingDates";
import { toISODate } from "@/src/utils/toISODate";
import { updateBookingTotalPrice } from "@/src/services/booking/updateBookingTotalPrice";
import { updateBookingNote } from "@/src/services/booking/updateBookingNote";
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
import { confirmBooking } from "@/src/services/booking/confirmBooking";
import { createBookingCalendars } from "@/src/services/booking/createBookingCalendars";

const STEPS = ["Guest Info", "Calendar", "Pricing", "Note"];

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [maxGuest, setMaxGuest] = useState(0);
  const [note, setNote] = useState("");
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [disabledDates, setDisabledDates] = useState<Date[]>([]);
  const [listing, setListing] = useState<Listing | null>(null);
  const [home, setHome] = useState<Home | null>(null);
  const [address, setAddress] = useState("");
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);

  const searchParams = useSearchParams();
  const listingId = Number(searchParams.get("listing"));

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

  const progress = ((step + 1) / STEPS.length) * 100;

  const canNext = () => {
    switch (step) {
      case 0:
        return (
          guest.fullname.trim() !== "" &&
          guest.email.trim() !== "" &&
          guest.phone.trim() !== ""
        );

      case 1:
        return Boolean(
          dateRange?.from &&
          dateRange?.to &&
          dateRange.from.getTime() !== dateRange.to.getTime(),
        );
      case 3:
        return note.trim().length > 0;

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

      if (!dateRange?.from || !dateRange?.to) {
        toast.error("Please select check-in & check-out dates");
        return;
      }

      try {
        await updateBookingDates({
          booking_id: bookingId,
          check_in_date: toISODate(dateRange.from),
          check_out_date: toISODate(dateRange.to),
        });
      } catch (err) {
        toast.error("Failed to update booking dates");
        console.error("Update booking dates failed:", err);
        return;
      }
    }

    //STEP 2 — update total price
    if (step === 2) {
      try {
        if (!bookingId) {
          toast.error("Booking not found");
          return;
        }

        if (!totalPrice) {
          toast.error("Please total price is null");
          return;
        }

        await updateBookingTotalPrice({
          booking_id: bookingId,
          total_price: totalPrice,
        });
      } catch (err) {
        toast.error("Failed to update booking total price");
        console.error("Update booking total price failed:", err);
        return;
      }
    }

    //STEP 3 — update total price
    if (step === 3) {
      try {
        if (!bookingId) {
          toast.error("Booking not found");
          return;
        }

        if (!note || !note.trim()) {
          toast.error("Please enter note content!");
          return;
        }

        await updateBookingNote({ booking_id: bookingId, note: note });

        setOpenConfirmDialog(true);
      } catch (err) {
        toast.error("Failed to update booking note");
        console.error("Update booking note failed:", err);
        return;
      }
    }

    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 0));
  };

  // !fix ui: flashing toast inform
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
      const listing = await getListingById(listingId.toString());

      if (listing) {
        setListing(listing);
        if (
          listing.province_code &&
          listing.district_code &&
          listing.ward_code
        ) {
          const province = await getProvinceByCode(listing.province_code);
          const district = await getDistrictByCode(listing.district_code);
          const ward = await getWardByCode(listing.ward_code);

          if (province && district && ward && listing.address_detail) {
            const address = [
              listing.address_detail,
              ward.full_name ?? ward.name,
              district.full_name ?? district.name,
              province.full_name ?? province.name,
            ]
              .filter(Boolean)
              .join(", ");

            setAddress(address);
          }
        }
      } else {
        toast.error("Failed to get listing!");
        router.back();
        throw new Error("Fetch Listing failed, please try again!");
      }
    };

    // home info
    const fetchHomeInfo = async () => {
      const home = await getHomeByListingId(listingId.toString());

      if (home) {
        setHome(home);
        setMaxGuest(home.max_guests);
      } else {
        toast.error("Failed to get detail!");
        router.back();
        throw new Error("Fetch home failed, please try again!");
      }
    };

    // calendar
    const fetchCalendar = async () => {
      const calendarData = await getListingCalendar(listingId);

      // disable các ngày hết chỗ
      const disabled = calendarData
        .filter((d) => d.available_count < 1)
        .map((d) => new Date(d.date + "T00:00:00"));
      setDisabledDates(disabled);
    };

    const run = async () => {
      try {
        await Promise.all([
          fetchUserInfo(),
          fetchListingInfo(),
          fetchHomeInfo(),
          fetchCalendar(),
        ]);
      } catch (error) {
        console.error("booking error (fetch): ", error);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const handleConfirm = async () => {
    try {
      //confirm booking
      const booking = await confirmBooking(bookingId!);
      toast.success("Booking confirmed successfully");

      //build calendar

      if (dateRange && home)
        await createBookingCalendars({
          listingId: booking.listing_id,
          dateRange,
          weekdayPrice: home.price_weekday,
          weekendPrice: home.price_weekend,
          maxGuest: maxGuest,
        });

      setLoading(true);
      setOpenConfirmDialog(false);

      router.push(`/book/homes/${booking.id}/success`);
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

  if (listing && home)
    return (
      <div className="bg-white py-10 px-40 pb-20">
        {/* Header */}
        <div className="flex items-center gap-5 mb-8">
          <ArrowLeft
            className="p-1.5 rounded-full bg-slate-100"
            size={35}
            onClick={() => router.back()}
          />
          <p className="text-4xl font-semibold">Request to Book</p>
        </div>

        {/* Progress */}
        <Progress value={progress} className="mb-10" />

        <div className="flex gap-10 items-start">
          {/* LEFT */}
          <div className="flex-1 border p-6 rounded-2xl">
            <div className="space-y-6">
              {step === 0 && <GuestInfo value={guest} onChange={setGuest} />}

              {step === 1 && (
                <CalendarStep
                  value={dateRange}
                  onChange={setDateRange}
                  disabledDates={disabledDates}
                />
              )}

              {step === 2 && (
                <PricingStep
                  onTotalChange={setTotalPrice}
                  price_weekday={home.price_weekday}
                  price_weekend={home.price_weekend}
                  dateRange={dateRange}
                />
              )}

              {step === 3 && <NoteStep note={note} setNote={setNote} />}

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  disabled={step === 0}
                  onClick={handleBack}
                >
                  Back
                </Button>

                <Button disabled={!canNext()} onClick={handleNext}>
                  {step === STEPS.length - 1 ? "Confirm Booking" : "Next"}
                </Button>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="w-1/3 sticky top-10 h-fit self-start">
            <ListingSummary
              address={address}
              price_weekday={home?.price_weekday}
              price_weekend={home?.price_weekend}
              title={listing?.title}
              maxGuest={maxGuest}
              dateRange={dateRange}
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
                  won’t be able to edit it after this step.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>

                <AlertDialogAction onClick={handleConfirm}>
                  Confirm booking
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    );
}
