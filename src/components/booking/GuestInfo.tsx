/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from "@/components/ui/input";

export default function GuestInfo({ value, onChange }: any) {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <p className="text-2xl font-semibold">Guest information</p>
        <p className="text-sm text-slate-500">
          Please enter the guest details for this booking
        </p>
      </div>

      {/* Full name */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Full name</label>
        <Input
          placeholder="Lamelo Ball"
          value={value.fullname}
          required
          className="rounded-xl h-11 focus-visible:ring-2 focus-visible:ring-black"
          onChange={(e) => onChange({ ...value, fullname: e.target.value })}
        />
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">
          Email address
        </label>
        <Input
          type="email"
          placeholder="lamelo@example.com"
          value={value.email}
          required
          className="rounded-xl h-11 focus-visible:ring-2 focus-visible:ring-black"
          onChange={(e) => onChange({ ...value, email: e.target.value })}
        />
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">
          Phone number
        </label>
        <Input
          placeholder="+84 912 345 678"
          value={value.phone}
          required
          className="rounded-xl h-11 focus-visible:ring-2 focus-visible:ring-black"
          onChange={(e) => onChange({ ...value, phone: e.target.value })}
        />
      </div>
    </div>
  );
}
