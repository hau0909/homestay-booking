export interface Voucher {
  id: number;
  listing_id: number;
  code: string;
  discount_value: number;
  min_price: number | null;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}
