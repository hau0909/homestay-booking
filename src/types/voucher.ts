export interface Voucher {
  id: number;
  code: string;
  discount_percent: number | null;
  max_discount_amount: number | null;
  start_date: string | null;
  end_date: string | null;
  usage_limit: number | null;
  is_active: boolean;
}
