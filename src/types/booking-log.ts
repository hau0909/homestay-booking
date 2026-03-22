import { BookingStatus, PaymentStatus } from "./enums";

export interface BookingLog {
  id: number;
  booking_id: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  created_at: string | null;
}
