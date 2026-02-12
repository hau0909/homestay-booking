/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CalendarReview from "@/src/components/calendar/CalendarReview";
import { getBookingByMonth } from "@/src/services/booking/getBookingByMonth";
import { blockDates } from "@/src/services/calendar/blockDates";
import { getCalendarStatus } from "@/src/services/calendar/getCalenndarStatus";
import { getHomeByListingId } from "@/src/services/home/getHomeByListingId";
import { getHostListings } from "@/src/services/listing/getHostListings";
import { getUser } from "@/src/services/profile/getUserProfile";
import { Booking } from "@/src/types/booking";
import { Listing } from "@/src/types/listing";
import { formatDateLocal } from "@/src/utils/fomartDateLocal";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Page() {
  const router = useRouter();

  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [listings, setListings] = useState<Listing[] | null>(null);
  const [currentListing, setCurrentListing] = useState<Listing | null>(null);
  const [currentCalendar, setCurrentCalendar] = useState(new Date());
  const [currentBookings, setCurrentBookings] = useState<Booking[] | null>(
    null,
  );

  const [quantity, setQuantity] = useState(0);

  const [price, setPrice] = useState<{
    weekday: number;
    weekend: number;
  }>({ weekday: 0, weekend: 0 });

  const [isBlocking, setIsBlocking] = useState(false);
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);

  const [blockedDatesFromDB, setBlockedDatesFromDB] = useState<Date[]>([]);
  const [unavailableDatesFromDB, setUnavailableDatesFromDB] = useState<Date[]>(
    [],
  );

  // fetch listig
  const fetchListing = async (userId: string) => {
    const listings = await getHostListings(userId);
    if (listings) {
      const availableListings = listings.filter(
        (item) => item.status === "ACTIVE",
      );
      setListings(availableListings);
      setCurrentListing(availableListings[0]);

      return availableListings[0];
    }
  };

  // fetch price { weekday & weekend price } & max guests
  const fetchPrice = async (listingId: string) => {
    const home = await getHomeByListingId(listingId);
    if (home) {
      setPrice({
        weekday: home?.price_weekday,
        weekend: home?.price_weekend,
      });
      setQuantity(home?.quantity);
    }
  };

  // fetch calendar { blocked & unvailable dates}
  const fetchCalendar = async (listingId: number) => {
    const year = currentCalendar.getFullYear();
    const month = currentCalendar.getMonth();

    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);

    const { blockedDates, limitedDates } = await getCalendarStatus(
      listingId,
      formatDateLocal(start),
      formatDateLocal(end),
    );

    setBlockedDatesFromDB(blockedDates);
    setUnavailableDatesFromDB(limitedDates);
  };

  // fetch bookng
  const fetchBooking = async (listingId: number) => {
    const bookings = await getBookingByMonth(
      listingId,
      currentCalendar.getMonth() + 1,
      currentCalendar.getFullYear(),
    );

    setCurrentBookings(bookings);
  };

  useEffect(() => {
    const fetch = async () => {
      const { user } = await getUser();

      if (user) {
        // fetch initial listing
        const currentListing = await fetchListing(user.id);

        if (currentListing) {
          // fetch price
          await fetchPrice(currentListing.id.toString());
        }
      }
      setIsFetching(false);
    };
    fetch();
  }, []);

  // changing month & listing
  useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true);
        if (currentListing) {
          await fetchBooking(currentListing.id);
          await fetchCalendar(currentListing.id);
        }
      } catch (error) {
        console.error("Error fetch(bookings & calendar): ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetch();
  }, [currentListing, currentCalendar]);

  // block dates
  const handleBlockDates = async () => {
    setIsBlocking(true);

    if (!currentListing) return;

    const isBlocked = await blockDates(
      currentListing.id,
      blockedDates,
      quantity,
    );

    if (isBlocked) {
      toast.success("Blocked dates successfully!");
      await fetchCalendar(currentListing.id);
      setBlockedDates([]);
      setIsBlocking(false);
    } else {
      toast.error("Failed block dates, try again!");
      setIsBlocking(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center my-50">
        <Loader2 className="animate-spin" size={50} />
      </div>
    );
  }

  if (!listings || listings.length <= 0) {
    return (
      <div className="my-50 space-y-3">
        <p className="text-center text-xl text-muted-foreground">
          No Listing found to set calendar.
        </p>
        <div className="flex justify-center">
          <Button onClick={() => router.back()}>back</Button>
        </div>
      </div>
    );
  } else
    return (
      <div className="w-full px-20 pb-10 flex gap-5 min-h-170">
        {/* left */}
        <div className="w-1/10 space-y-4">
          {listings.map((item) => (
            <div
              key={item.id}
              className="flex justify-end group cursor-pointer"
              onClick={() => setCurrentListing(item)}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`rounded-lg duration-300 transition-all ease-in-out
                group-hover:scale-110 ${item.id === currentListing?.id && "border border-slate-600"}`}
                  >
                    <Image
                      src={"/placeholder-img.png"}
                      width={80}
                      height={80}
                      alt={""}
                      className="p-2 rounded-xl"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{item.title}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          ))}
        </div>

        {/* center */}
        <div className="w-6/10">
          {isLoading ? (
            <div className="flex justify-center mt-30">
              <Loader2 size={40} className="animate-spin" />
            </div>
          ) : (
            <CalendarReview
              // current calendar
              currentCalendar={currentCalendar}
              setCurrentCalendar={setCurrentCalendar}
              // block dates
              blockedDates={blockedDates}
              setBlockedDates={setBlockedDates}
              // blocked & unavailable dates form DB
              blockedDatesFromDB={blockedDatesFromDB}
              unavailableDates={unavailableDatesFromDB}
              // state block dates
              isBlocking={isBlocking}
              onBlockDates={handleBlockDates}
              price={price}
            />
          )}
        </div>

        {/* right */}
        <div className="w-3/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Bookings</h3>
            <span className="text-xs text-muted-foreground">
              {currentCalendar.getMonth() === 1
                ? "this month"
                : format(currentCalendar, "MMMM yyyy")}
            </span>
          </div>
          {isLoading ? (
            <div className="flex justify-center mt-30">
              <Loader2 size={40} className="animate-spin" />
            </div>
          ) : !currentBookings || currentBookings.length <= 0 ? (
            <div>
              <p className="text-sm text-center mt-50 text-muted-foreground">
                No booking found in {format(currentCalendar, "MMMM yyyy")}.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentBookings.map((booking) => {
                const isApproved = booking.status === "CONFIRMED";

                return (
                  <div
                    key={booking.id}
                    className={`
            group rounded-xl border p-4 text-sm bg-white
            transition hover:shadow-md hover:-translate-y-px
            ${isApproved ? "border-green-300" : "border-yellow-300"}
          `}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{booking.id}</p>

                      {/* status dot */}
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          isApproved ? "bg-green-500" : "bg-yellow-400"
                        }`}
                      />
                    </div>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {booking.check_in_date} → {booking.check_out_date}
                    </p>

                    <div className="mt-2 flex justify-between items-center">
                      {/* status badge */}
                      <span
                        className={`
                text-xs px-2 py-0.5 rounded-full border
                ${
                  isApproved
                    ? "text-green-700 border-green-300 bg-green-50"
                    : "text-yellow-700 border-yellow-300 bg-yellow-50"
                }
              `}
                      >
                        {booking.status}
                      </span>

                      <span className="text-sm">
                        <span className="text-muted-foreground">
                          Total price:
                        </span>{" "}
                        ${booking.total_price}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
}
