"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditListingCancelPolicyPage() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const id = params.listingId;
    if (id != null && id !== "") {
      router.replace(`/hosting/policies?edit=${encodeURIComponent(String(id))}`);
    }
  }, [params.listingId, router]);

  return (
    <div className="min-h-screen bg-[#f7fafd] p-8 text-slate-500">Loading…</div>
  );
}
