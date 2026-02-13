"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import { getHostDashboardData } from "@/src/services/host/getHostDashboardData";

export default function HostDashboardPage() {
  const router = useRouter();
  const [listings, setListings] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const data = await getHostDashboardData(user.id);
      setListings(data.listings);
      setBookings(data.bookings);

      setLoading(false);
    }

    load();
  }, []);

 const totalRevenue = useMemo(() => {
  return bookings
    .filter(
      b =>
        b.status !== "CANCELLED" &&
        b.payment_status === "PAID"
    )
    .reduce((sum, b) => sum + (b.total_price || 0), 0);
}, [bookings]);


  if (loading) {
    return <div className="p-6 text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Dashboard Overview</h1>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Listings" value={listings.length} />
        <StatCard
          title="Active Listings"
          value={listings.filter(l => l.status === "ACTIVE").length}
        />
        <StatCard title="Total Bookings" value={bookings.length} />
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          highlight
        />
      </div>

      {/* LISTINGS */}
      <Section
        title="Recent Listings"
        onViewMore={() => router.push("/hosting/listing")}
      >
        <Table
          headers={["Title", "Type", "Status", "Created"]}
          rows={listings.slice(0, 5).map(l => [
            l.title,
            l.listing_type,
            <StatusBadge key={l.id} value={l.status} />,
            new Date(l.created_at).toLocaleDateString(),
          ])}
        />
      </Section>

      {/* BOOKINGS */}
      <Section
        title="Recent Bookings"
        onViewMore={() => router.push("/hosting/bookings")}
      >
        <Table
          headers={["Listing ID", "Check-in", "Check-out", "Status", "Total"]}
          rows={bookings.slice(0, 3).map(b => [
            b.listing_id,
            b.check_in_date,
            b.check_out_date,
            <StatusBadge key={b.id} value={b.status} />,
            `$${b.total_price}`,
          ])}
        />
      </Section>
    </div>
  );
}

/* ================= UI COMPONENTS ================= */

function StatCard({
  title,
  value,
  highlight,
}: {
  title: string;
  value: any;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border bg-white p-4 shadow-sm ${
        highlight ? "border-green-500" : ""
      }`}
    >
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Section({
  title,
  onViewMore,
  children,
}: {
  title: string;
  onViewMore?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">{title}</h2>
        {onViewMore && (
   <button
  onClick={onViewMore}
  className="
    inline-flex items-center gap-1
    rounded-lg border px-3 py-1.5
    text-sm font-medium text-gray-700
    hover:bg-gray-50 hover:text-gray-900
    transition
  "
>
  Xem thêm
  <span className="text-base">→</span>
</button>


        )}
      </div>
      {children}
    </section>
  );
}

function Table({
  headers,
  rows,
}: {
  headers: string[];
  rows: any[][];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {headers.map(h => (
              <th
                key={h}
                className="px-3 py-2 text-left font-medium text-gray-600"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-t hover:bg-gray-50 transition"
            >
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ value }: { value: string }) {
  const color =
    value === "ACTIVE" || value === "COMPLETED"
      ? "bg-green-100 text-green-700"
      : value === "PENDING"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-gray-100 text-gray-600";

  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${color}`}
    >
      {value}
    </span>
  );
}
