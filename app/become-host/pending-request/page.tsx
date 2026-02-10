"use client";
import React from "react";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();

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
            Thank you for submitting your documents. Our team is reviewing your
            information to make sure everything is in order.
          </p>

          <p className="mt-4 text-sm text-neutral-500">
            This usually takes less than <strong>24 hours</strong>.
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

        {/* Actions */}
        <div className="mt-10 flex flex-col gap-3">
          <button
            onClick={() => router.push("/")}
            className="w-full rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 cursor-pointer"
          >
            Back to homepage
          </button>

          <button
            onClick={() => router.push("/support")}
            className="w-full rounded-xl border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 cursor-pointer"
          >
            Contact support
          </button>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs text-neutral-400">
          You’ll receive an email once your verification is complete.
        </p>
      </div>
    </div>
  );
};

export default Page;
