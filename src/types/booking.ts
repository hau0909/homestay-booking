import { BookingStatus, PaymentStatus } from "./enums";

export interface Booking {
  id: number;
  user_id: string;
  listing_id: number;

  check_in_date: string | null;
  check_out_date: string | null;

  experience_slot_id: number | null;

  total_guests: number;
  total_price: number;

  status: BookingStatus;
  payment_status: PaymentStatus;

  note: string | null;
  created_at: string;
  updated_at: string;
}
