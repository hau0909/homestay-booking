import { PaymentStatus } from "./enums";

export interface Payment {
  id: number;
  booking_id: number;
  amount: number;
  provider: string | null;
  transaction_code: string | null;
  status: PaymentStatus;
  created_at: string;
}
