"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import AddCancellationPolicyModal from "@/src/components/hosting/AddCancellationPolicyModal";
import EditCancellationPolicyModal from "@/src/components/hosting/EditCancellationPolicyModal";
import { getHostListings } from "@/src/services/listing/getHostListings";
import { getListingMainImages } from "@/src/services/listing/getListingMainImages";
import { getPoliciesByListingIds } from "@/src/services/cancel-policy/getPoliciesByListingIds";
import type { Listing } from "@/src/types/listing";
import type { CancelPolicy } from "@/src/types/cancel-policy";
import toast from "react-hot-toast";

function PoliciesSetupPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [images, setImages] = useState<Record<number, string>>({});
  const [policies, setPolicies] = useState<Record<number, CancelPolicy[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editListingId, setEditListingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"HOME" | "EXPERIENCE">("HOME");
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user?.id) {
        setListings([]);
        setImages({});
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await getHostListings(user.id);
        if (cancelled) return;
        setListings(data);
        const ids = data.map((l) => l.id);
        const [imgMap, polMap] = await Promise.all([
          ids.length ? getListingMainImages(ids) : {},
          ids.length ? getPoliciesByListingIds(ids) : {},
        ]);
        if (!cancelled) {
          setImages(imgMap);
          setPolicies(polMap);
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load listings");
          setListings([]);
          setImages({});
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    const add = searchParams.get("add") === "1";
    const edit = searchParams.get("edit");
    if (add) {
      setAddModalOpen(true);
      setEditListingId(null);
      router.replace("/hosting/policies", { scroll: false });
      return;
    }
    if (edit) {
      const n = Number(edit);
      if (!Number.isNaN(n)) setEditListingId(n);
      setAddModalOpen(false);
      router.replace("/hosting/policies", { scroll: false });
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (editListingId === null || loading) return;
    const found = listings.some((l) => l.id === editListingId);
    if (!found) {
      toast.error("Listing not found.");
      setEditListingId(null);
    }
  }, [editListingId, listings, loading]);

  const filtered = listings.filter(
    (l) => l.listing_type === activeTab && policies[l.id]?.length
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f7fafd] p-8 text-slate-500">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f7fafd] p-8 text-slate-600">
        Please log in to manage cancellation policies.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7fafd] p-8 text-slate-500">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f7fafd] p-8 text-red-600">{error}</div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7fafd] p-8">
      <div className="flex flex-col gap-0 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-800 md:text-3xl">
            Cancellation Policies Setup
          </h1>

          <div className="mt-6 flex gap-8 border-b-2 border-[#e3e8ee]">
            {(["HOME", "EXPERIENCE"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-lg font-semibold transition ${
                  activeTab === tab
                    ? "border-b-[3px] border-[#328E6E] text-[#328E6E]"
                    : "border-b-[3px] border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab === "HOME" ? "Home" : "Experience"}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditListingId(null);
            setAddModalOpen(true);
          }}
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-[#328E6E] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#256d52] sm:mt-0"
        >
          Add Policies
        </button>
      </div>

      <AddCancellationPolicyModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        listings={listings}
        images={images}
        policies={policies}
        listingType={activeTab}
        onSaved={async () => {
          const ids = listings.map((l) => l.id);
          const polMap = ids.length ? await getPoliciesByListingIds(ids) : {};
          setPolicies(polMap);
        }}
      />

      <EditCancellationPolicyModal
        open={editListingId !== null}
        onOpenChange={(open) => {
          if (!open) setEditListingId(null);
        }}
        listing={
          editListingId != null
            ? listings.find((l) => l.id === editListingId) ?? null
            : null
        }
        imageUrl={
          editListingId != null ? images[editListingId] : undefined
        }
        policies={
          editListingId != null ? policies[editListingId] ?? [] : []
        }
        onSaved={async () => {
          const ids = listings.map((l) => l.id);
          const polMap = ids.length ? await getPoliciesByListingIds(ids) : {};
          setPolicies(polMap);
        }}
      />

      <div className="mt-8 overflow-x-auto rounded-2xl border-[1.5px] border-[#e3e8ee] bg-white p-2 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
        {filtered.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-500">
            No {activeTab === "HOME" ? "home" : "experience"} listings with policies yet. Click <strong>Add Policies</strong> to create one.
          </p>
        ) : (
          <ul className="w-full min-w-0 divide-y divide-slate-200">
            {filtered.map((listing) => (
              <li
                key={listing.id}
                className="flex w-full flex-col gap-4 px-3 py-5 sm:flex-row sm:items-center sm:gap-6"
              >
                <div className="shrink-0">
                  {images[listing.id] ? (
                    <img
                      src={images[listing.id]}
                      alt=""
                      className="h-16 w-24 rounded-md object-cover sm:h-[72px] sm:w-[108px]"
                    />
                  ) : (
                    <div className="flex h-16 w-24 items-center justify-center rounded-md bg-slate-100 text-xs text-slate-400 sm:h-[72px] sm:w-[108px]">
                      No image
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{listing.title}</p>
                  <p className="mt-0.5 text-sm text-slate-600">
                    {listing.address_detail?.trim() || "—"}
                  </p>
                  <span className="mt-1.5 inline-block rounded-full bg-[#328E6E]/10 px-2.5 py-0.5 text-xs font-medium text-[#328E6E]">
                    {(policies[listing.id]?.length ?? 0) === 1
                      ? "1 policy"
                      : `${policies[listing.id]?.length ?? 0} policies`}
                  </span>
                </div>
                <div className="shrink-0 sm:ml-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setAddModalOpen(false);
                      setEditListingId(listing.id);
                    }}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50"
                  >
                    Edit Policy
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function PoliciesSetupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f7fafd] p-8 text-slate-500">
          Loading…
        </div>
      }
    >
      <PoliciesSetupPageInner />
    </Suspense>
  );
}
