"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { isValidEmail, isValidPhone } from "@/src/utils/validGuestInfo";

type Guest = {
  fullname: string;
  email: string;
  phone: string;
};

interface ExperienceGuestInfoProps {
  guest: Guest;
  setGuest: (guest: Guest) => void;
  onNext: () => void;
  canProceed: boolean;
}

export default function ExperienceGuestInfo({
  guest,
  setGuest,
  onNext,
  canProceed,
}: ExperienceGuestInfoProps) {
  const errors = {
    fullname: guest.fullname.trim() === "",
    email: guest.email.trim() === "" || !isValidEmail(guest.email),
    phone: guest.phone.trim() === "" || !isValidPhone(guest.phone),
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Step 1 Header */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex justify-center items-center text-slate-800 font-bold">
            1
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-slate-800">
              Guest information
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              Please enter the guest details for this booking.
            </p>
          </div>
        </div>

        <div className="space-y-6 ml-0 md:ml-12 pt-2">
          {/* Full name */}
          <div className="space-y-1.5 w-full md:w-2/3">
            <label className="text-sm font-medium text-slate-700">
              Full name
            </label>
            <Input
              placeholder="Lamelo Ball"
              value={guest.fullname}
              className="rounded-xl h-11"
              onChange={(e) => setGuest({ ...guest, fullname: e.target.value })}
            />
            {errors.fullname && (
              <p className="text-sm text-red-500">Full name is required</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5 w-full md:w-2/3">
            <label className="text-sm font-medium text-slate-700">
              Email address
            </label>
            <Input
              type="email"
              placeholder="lamelo@example.com"
              value={guest.email}
              className="rounded-xl h-11"
              onChange={(e) => setGuest({ ...guest, email: e.target.value })}
            />
            {errors.email && (
              <p className="text-sm text-red-500">Invalid email address</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5 w-full md:w-2/3">
            <label className="text-sm font-medium text-slate-700">
              Phone number
            </label>
            <Input
              placeholder="0912345678"
              value={guest.phone}
              className="rounded-xl h-11"
              onChange={(e) => setGuest({ ...guest, phone: e.target.value })}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">
                Phone must contain numbers only
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Area Step 1 */}
      <div className="ml-0 md:ml-12 pt-6 border-t border-slate-100 flex justify-end">
        <Button
          size="lg"
          className="w-full md:w-auto px-10 text-lg h-14"
          disabled={!canProceed}
          onClick={onNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
