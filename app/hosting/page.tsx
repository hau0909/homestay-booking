"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import { getHostDashboardData } from "@/src/services/host/getHostDashboardData";
import { RevenueChart } from "@/src/components/hosting/RevenueChart";
import {
  Building2,
  BookOpen,
  TrendingUp,
  Wallet,
  ChevronRight,
  CalendarDays,
  CheckCircle,
} from "lucide-react";

export default function HostDashboardPage() {
  const router = useRouter();
  const [listings, setListings] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [hostId, setHostId] = useState<string | null>(null);
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

      setHostId(user.id);

      const data = await getHostDashboardData(user.id);
      setListings(data.listings);
      setBookings(data.bookings);

      setLoading(false);
    }

    load();
  }, []);

  const totalRevenue = useMemo(() => {
    return bookings
      .filter((b) => b.status === "PAID" || b.status === "COMPLETED")
      .reduce((sum, b) => sum + (b.total_price || 0), 0);
  }, [bookings]);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div className="px-6 py-10 space-y-8">
      {/* HEADER */}
      <div className="space-y-1">
        <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm">
          Your hosting performance at a glance
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Building2 className="w-5 h-5 text-slate-600" />}
          title="Total Listings"
          value={listings.length}
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
          title="Active"
          value={listings.filter((l) => l.status === "ACTIVE").length}
        />
        <StatCard
          icon={<CalendarDays className="w-5 h-5 text-indigo-600" />}
          title="Bookings"
          value={bookings.length}
        />
        <StatCard
          icon={<Wallet className="w-5 h-5 text-amber-600" />}
          title="Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          highlight
        />
      </div>
      {/* CHART */}
      <div className="rounded-2xl border border-slate-200 shadow-lg p-6">
        {hostId && <RevenueChart hostId={hostId} />}
      </div>

      {/* TABLES */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 shadow-lg p-6">
          <Section
            title="Recent Listings"
            onViewMore={() => router.push("/hosting/listing")}
          >
            <Table
              headers={["Title", "Type", "Status", "Date"]}
              rows={listings
                .slice(0, 5)
                .map((l) => [
                  <span className="font-medium text-slate-900 truncate">
                    {l.title}
                  </span>,
                  <span className="text-slate-500 text-sm">
                    {l.listing_type}
                  </span>,
                  <StatusBadge key={l.id} value={l.status} />,
                  <span className="text-slate-500 text-sm">
                    {new Date(l.created_at).toLocaleDateString()}
                  </span>,
                ])}
            />
          </Section>
        </div>

        <div className="rounded-2xl border border-slate-200 shadow-lg p-6">
          <Section
            title="Recent Bookings"
            onViewMore={() => router.push("/hosting/bookings")}
          >
            <Table
              headers={["Customer", "Check-in", "Check-out", "Status", "Total"]}
              rows={bookings
                .slice(0, 5)
                .map((b) => [
                  <span className="text-slate-600 text-sm">
                    {b.profiles?.full_name ?? "Unknown guest"}
                  </span>,
                  <span className="text-slate-500 text-sm">
                    {b.check_in_date}
                  </span>,
                  <span className="text-slate-500 text-sm">
                    {b.check_out_date}
                  </span>,
                  <StatusBadge key={b.id} value={b.status} />,
                  <span className="font-medium text-emerald-600">
                    ${b.total_price}
                  </span>,
                ])}
            />
          </Section>
        </div>
      </div>
    </div>
  );
}

/* ================= UI COMPONENTS ================= */

function StatCard({
  icon,
  title,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  title: string;
  value: any;
  highlight?: boolean;
}) {
  return (
    <div
      className={`
        rounded-xl border bg-white
        transition-all duration-200
        ${highlight ? "border-slate-300 shadow-sm" : "border-slate-200"}
        hover:shadow-md
        p-5
      `}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {title}
          </p>
          <p
            className={`
              text-2xl font-semibold
              ${highlight ? "text-slate-900" : "text-slate-800"}
            `}
          >
            {value}
          </p>
        </div>

        <div
          className="
            p-2 rounded-lg
            bg-slate-100
            text-slate-600
          "
        >
          {icon}
        </div>
      </div>
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>

        {onViewMore && (
          <button
            onClick={onViewMore}
            className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-black transition"
          >
            View all <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {children}
    </div>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: any[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            {headers.map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
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
              className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
            >
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-slate-700">
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
  const statusConfig: Record<string, { bg: string; text: string }> = {
    ACTIVE: {
      bg: "bg-emerald-100",
      text: "text-emerald-800",
    },
    COMPLETED: {
      bg: "bg-emerald-100",
      text: "text-emerald-800",
    },
    PENDING: {
      bg: "bg-amber-100",
      text: "text-amber-800",
    },
    CANCELLED: {
      bg: "bg-rose-100",
      text: "text-rose-800",
    },
  };

  const config = statusConfig[value] ?? {
    bg: "bg-slate-100",
    text: "text-slate-700",
  };

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium
        ${config.bg} ${config.text}
      `}
    >
      {value}
    </span>
  );
}
