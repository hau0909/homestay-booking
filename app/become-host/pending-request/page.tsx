"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/");
    }, 3000);

    return () => clearTimeout(timer); // cleanup tránh memory leak
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-6">
      <div className="w-full max-w-xl rounded-3xl border border-neutral-200 bg-white p-10 shadow-sm">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-600 text-4xl">
            ⏳
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Verification in progress
          </h1>
          <p className="mt-3 text-neutral-600 leading-relaxed">
            Thank you for submitting your documents.
          </p>

          <p className="mt-4 text-sm text-neutral-500">
            Redirecting to homepage in <strong>3 seconds...</strong>
          </p>
        </div>

        {/* Status */}
        <div className="mt-8 rounded-2xl bg-neutral-50 p-5 text-sm text-neutral-700">
          <div className="flex items-center justify-between">
            <span>Application status</span>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
              Pending
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
