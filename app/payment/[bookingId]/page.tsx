/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

import { getBookingById } from "@/src/services/booking/getBookingById";
import { getListingById } from "@/src/services/listing/getListingById";
import { getHomeByListingId } from "@/src/services/home/getHomeByListingId";
import { getExperience } from "@/src/services/experience/getExperience";
import { getExperienceSlots } from "@/src/services/experience/getExperienceSlots";
import { getProvinceByCode } from "@/src/services/location/getProvinceByCode";
import { getDistrictByCode } from "@/src/services/location/getDistrictByCode";
import { getWardByCode } from "@/src/services/location/getWardByCode";
import { getUserBankAccount } from "@/src/services/banking/getUserBankAccount";

import { Booking } from "@/src/types/booking";
import { Listing } from "@/src/types/listing";
import { Home } from "@/src/types/home";
import { Experience } from "@/src/types/experience";
import { ExperienceSlot } from "@/src/types/experienceSlot";
import { BankAccount } from "@/src/types/bankAccount";

import ListingSummary from "@/src/components/booking/ListingSumary";
import ExperienceListingSummary from "@/src/components/booking/ExperienceListingSummary";
import toast from "react-hot-toast";

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { bookingId } = useParams();
  const listingIdStr = searchParams.get("listingId");

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [address, setAddress] = useState("");

  const [home, setHome] = useState<Home | null>(null);
  const [experience, setExperience] = useState<Experience | null>(null);
  const [slot, setSlot] = useState<ExperienceSlot | null>(null);
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!bookingId || Array.isArray(bookingId)) return;

      try {
        const b = await getBookingById(bookingId);
        if (!b) throw new Error("Booking not found");

        if (b.payment_status === "PAID" || b.payment_status === "REFUNDED") {
          router.push("/bookings");
          toast.error("Booking Not found!");
          return;
        }
        setBooking(b);

        let currentListingId = b.listing_id;
        if (!currentListingId && listingIdStr) {
          currentListingId = parseInt(listingIdStr, 10);
        }

        if (currentListingId) {
          const l = await getListingById(currentListingId.toString());
          setListing(l);

          if (l?.province_code && l?.district_code && l?.ward_code) {
            const province = await getProvinceByCode(l.province_code);
            const district = await getDistrictByCode(l.district_code);
            const ward = await getWardByCode(l.ward_code);

            const addr = [
              l.address_detail,
              ward?.full_name ?? ward?.name,
              district?.full_name ?? district?.name,
              province?.full_name ?? province?.name,
            ]
              .filter(Boolean)
              .join(", ");
            setAddress(addr);
          }

          if (b.experience_slot_id) {
            // It's an experience
            const exp = await getExperience(currentListingId);
            setExperience(exp);

            if (exp) {
              const slots = await getExperienceSlots(exp.id);
              const foundSlot = slots.find(
                (s) => s.id === b.experience_slot_id,
              );
              setSlot(foundSlot || null);
            }
          } else {
            // It's a stay (home)
            const h = await getHomeByListingId(currentListingId.toString());
            setHome(h);
          }

          // Fetch host bank account
          try {
            const bank = await getUserBankAccount(l.host_id);
            setBankAccount(bank);
          } catch (bankErr) {
            console.error("Failed to fetch host bank account:", bankErr);
          }
        }
      } catch (err: any) {
        console.error("Failed to load payment tracking data:", err);
        setErrorMsg(err.message || String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookingId, listingIdStr]);

  // Poll for payment status
  useEffect(() => {
    if (!bookingId || Array.isArray(bookingId)) return;

    const interval = setInterval(async () => {
      try {
        const b = await getBookingById(bookingId);
        if (b?.payment_status === "PAID") {
          toast.success("Payment Received Successfully!");
          setBooking(b);
          clearInterval(interval);
          // Optional: redirect after success
          setTimeout(() => {
            router.push(`/payment/${bookingId}/success`); // Redirect to success page
          }, 3000);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [bookingId, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-teal-500" size={50} />
      </div>
    );
  }

  if (errorMsg || !booking) {
    return (
      <div className="p-20 text-center">
        <h2 className="text-2xl font-bold">Booking not found</h2>
        {errorMsg && <p className="text-red-500 mt-2">{errorMsg}</p>}
        <Button onClick={() => router.push("/")} className="mt-4">
          Return Home
        </Button>
      </div>
    );
  }

  // Derive dateRange for Homes
  const dateRange =
    booking.check_in_date && booking.check_out_date
      ? {
          from: new Date(booking.check_in_date),
          to: new Date(booking.check_out_date),
        }
      : undefined;

  // Derive date for Experience
  const expDate = booking.check_in_date
    ? new Date(booking.check_in_date)
    : undefined;

  // Determine actual amount to pay. We'll use the raw value for demo. SePay takes amount in VND.
  const amountToPay = booking.total_price * 25000;
  const bankName = bankAccount?.bank_name || "MBBank";
  const accountNumber = bankAccount?.account_number || "0852933924";
  const accountName = bankAccount?.account_name || "LE DINH HAU";

  const qrCodeUrl = `https://qr.sepay.vn/img?bank=${bankName}&acc=${accountNumber}&template=compact&amount=${amountToPay}&des=BK${booking.id}&download=true`;

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto py-10 px-4 md:px-10 lg:px-20 pb-20">
        <div className="flex items-center gap-5 mb-8">
          <ArrowLeft
            className="p-2 rounded-full bg-white shadow-sm cursor-pointer hover:bg-slate-100 transition-colors"
            size={40}
            onClick={() => router.back()}
          />
          <p className="text-3xl font-semibold">Payment Details</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* LEFT: Payment Info & QR Code */}
          <div className="flex-1 w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                Complete your payment
              </h2>
              <p className="text-slate-500 mt-1">
                Scan the QR code with your banking app to pay
              </p>
            </div>

            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white border-2 border-dashed border-teal-200 rounded-2xl shadow-sm">
                <img
                  src={qrCodeUrl}
                  alt="Payment QR Code"
                  className="w-64 h-64 mx-auto rounded-lg"
                />
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <span className="text-slate-500">Bank</span>
                <span className="font-semibold text-slate-800">{bankName}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <span className="text-slate-500">Account Holder</span>
                <span className="font-semibold text-slate-800 uppercase">
                  {accountName}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <span className="text-slate-500">Account Number</span>
                <span className="font-semibold text-teal-600 text-lg">
                  {accountNumber}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <span className="text-slate-500">Amount</span>
                <span className="font-bold text-xl text-amber-600">
                  {amountToPay.toLocaleString("vi-VN")} VND
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-500">Transfer Message</span>
                <span className="font-semibold bg-amber-100 text-amber-800 px-3 py-1.5 rounded-md tracking-wider">
                  BK{booking.id}
                </span>
              </div>
            </div>

            <div className="bg-teal-50 text-teal-800 p-4 rounded-xl mt-6 flex items-start gap-3">
              <Info className="shrink-0 mt-0.5" size={20} />
              <div className="text-sm">
                <p className="font-semibold mb-1">Important Note</p>
                <p>
                  Please enter the EXACT transfer message{" "}
                  <strong>BK{booking.id}</strong> so our system can
                  automatically verify your payment.
                </p>
              </div>
            </div>

            <div className="text-center text-sm text-slate-500 mt-8 mb-4">
              <Loader2
                className="animate-spin mx-auto mb-3 text-teal-500"
                size={30}
              />
              <p className="font-medium text-slate-700">
                Waiting for payment...
              </p>
              <p className="mt-1">
                This page will automatically update once it is received.
              </p>
            </div>

            <Button
              className="w-full mt-4 h-12 text-lg text-slate-700 bg-white hover:bg-slate-50 border-slate-200 border shadow-sm"
              variant="outline"
              onClick={() => router.push("/")}
            >
              Pay Later
            </Button>
          </div>

          {/* RIGHT: Listing Summary */}
          <div className="w-full lg:w-1/3 space-y-4">
            {booking.experience_slot_id ? (
              <div className="pointer-events-none opacity-80">
                <ExperienceListingSummary
                  listingId={listing?.id || Number(listingIdStr) || 0}
                  title={listing?.title || "Experience"}
                  address={address}
                  price_per_person={experience?.price_per_person || 0}
                  selectedDate={expDate}
                  selectedSlot={slot}
                  guests={booking.total_guests || 1}
                  selectedVoucher={null}
                />
              </div>
            ) : (
              <div className="pointer-events-none opacity-80">
                <ListingSummary
                  listingId={listing?.id || Number(listingIdStr) || 0}
                  address={address}
                  price_weekday={home?.price_weekday || 0}
                  price_weekend={home?.price_weekend || 0}
                  title={listing?.title || "Stay"}
                  maxGuest={home?.max_guests || 1}
                  dateRange={dateRange}
                  selectedVoucher={null}
                />
              </div>
            )}

            {/* Total Price Card */}
            <div className="bg-slate-800 text-white rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center">
                <p className="font-medium">Final Confirmed Booking Total</p>
              </div>
              <p className="font-bold text-3xl mt-2">
                ${booking.total_price} USD
              </p>
              <p className="text-xs text-slate-400 mt-2">
                *This is the exact confirmed amount derived from your checkout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
