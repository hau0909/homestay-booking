import { Input } from "@/components/ui/input";
import { isValidEmail, isValidPhone } from "@/src/utils/validGuestInfo";

type Guest = {
  fullname: string;
  email: string;
  phone: string;
};

type Props = {
  value: Guest;
  onChange: (data: Guest) => void;
};

export default function GuestInfo({ value, onChange }: Props) {
  const errors = {
    fullname: value.fullname.trim() === "",
    email: value.email.trim() === "" || !isValidEmail(value.email),
    phone: value.phone.trim() === "" || !isValidPhone(value.phone),
  };

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
          className="rounded-xl h-11"
          onChange={(e) => onChange({ ...value, fullname: e.target.value })}
        />
        {errors.fullname && (
          <p className="text-sm text-red-500">Full name is required</p>
        )}
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
          className="rounded-xl h-11"
          onChange={(e) => onChange({ ...value, email: e.target.value })}
        />
        {errors.email && (
          <p className="text-sm text-red-500">Invalid email address</p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">
          Phone number
        </label>
        <Input
          placeholder="0912345678"
          value={value.phone}
          className="rounded-xl h-11"
          onChange={(e) => onChange({ ...value, phone: e.target.value })}
        />
        {errors.phone && (
          <p className="text-sm text-red-500">
            Phone must contain numbers only
          </p>
        )}
      </div>
    </div>
  );
}
