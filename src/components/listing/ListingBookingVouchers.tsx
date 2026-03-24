"use client";

import type { Voucher } from "@/src/types/voucher";
import { Tag } from "lucide-react";

type Props = {
  vouchers: Voucher[];
  formatPrice: (n: number | null) => string;
};

export default function ListingBookingVouchers({ vouchers, formatPrice }: Props) {
  if (vouchers.length === 0) return null;

  return (
    <div className="mb-4 flex flex-col gap-3">
      {vouchers.map((v) => (
        <article
          key={v.id}
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-3 flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-500"
              aria-hidden
            >
              <Tag className="h-5 w-5" strokeWidth={2} />
            </div>
            <span className="text-base font-bold uppercase tracking-wide text-gray-900">
              {v.code}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-gray-700">
            Get{" "}
            <span className="font-semibold text-gray-900">
              {formatPrice(v.discount_value)}
            </span>{" "}
            off
            {v.max_discount != null && (
              <>
                {" "}
                up to{" "}
                <span className="font-semibold text-gray-900">
                  {formatPrice(v.max_discount)}
                </span>
              </>
            )}
            {v.min_price != null && (
              <>
                {" "}
                when you spend at least{" "}
                <span className="font-semibold text-gray-900">
                  {formatPrice(v.min_price)}
                </span>
              </>
            )}
            .
          </p>
          {v.usage_limit != null && v.usage_limit > 0 ? (
            <div className="mt-3">
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{
                    width: `${Math.min(100, ((v.used_count ?? 0) / v.usage_limit) * 100)}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {v.used_count ?? 0} out of {v.usage_limit} uses
              </p>
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}
