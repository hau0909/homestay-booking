"use client";

import React, { useState } from "react";
import { sendBecomeHostRequest } from "@/src/services/host/host-application.service";
import {
  uploadIdentityCardBack,
  uploadIdentityCardFront,
} from "@/src/services/host/identity.service";
import { useAuth } from "@/src/hooks/useAuth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const Page = () => {
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleFrontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFrontImage(e.target.files[0]);
    }
  };

  const handleBackUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setBackImage(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!frontImage || !backImage) return;

    try {
      setLoading(true);

      const frontUrl = await uploadIdentityCardFront(user.id, frontImage);

      const backUrl = await uploadIdentityCardBack(user.id, backImage);

      await sendBecomeHostRequest(user.id, frontUrl, backUrl);

      toast.success("Send request successfully!");
      router.push("/become-host/pending-request");
    } catch (error: any) {
      console.log(error);
      toast.error(error.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-semibold text-neutral-900">
          Verify your identity
        </h1>
        <p className="mt-3 text-neutral-600">
          Upload your government ID to become a trusted host.
        </p>
      </div>

      {/* Card */}
      <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
        {/* Info */}
        <div className="mb-8 flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            🛡️
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">
              Government ID
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              Please upload clear photos of the front and back of your national
              ID card (CCCD).
            </p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {/* FRONT */}
          <div className="rounded-2xl border border-dashed border-neutral-300 p-6">
            <h3 className="mb-2 font-medium text-neutral-800">
              Front of ID card
            </h3>

            {frontImage ? (
              <div className="relative">
                <img
                  src={URL.createObjectURL(frontImage)}
                  alt="Front ID Preview"
                  className="h-48 w-full rounded-xl object-cover"
                />
                <button
                  onClick={() => setFrontImage(null)}
                  className="absolute right-2 top-2 rounded-full bg-white px-3 py-1 text-xs shadow"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-xl bg-neutral-50 text-center transition hover:bg-neutral-100">
                <span className="text-4xl">🪪</span>
                <p className="mt-2 text-sm text-neutral-600">
                  Upload front image
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFrontUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* BACK */}
          <div className="rounded-2xl border border-dashed border-neutral-300 p-6">
            <h3 className="mb-2 font-medium text-neutral-800">
              Back of ID card
            </h3>

            {backImage ? (
              <div className="relative">
                <img
                  src={URL.createObjectURL(backImage)}
                  alt="Back ID Preview"
                  className="h-48 w-full rounded-xl object-cover"
                />
                <button
                  onClick={() => setBackImage(null)}
                  className="absolute right-2 top-2 rounded-full bg-white px-3 py-1 text-xs shadow"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-xl bg-neutral-50 text-center transition hover:bg-neutral-100">
                <span className="text-4xl">🪪</span>
                <p className="mt-2 text-sm text-neutral-600">
                  Upload back image
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBackUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Security note */}
        <div className="mt-8 rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-600">
          🔒 Your ID is encrypted and only used for verification purposes.
        </div>

        {/* Actions */}
        <div className="mt-10 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-sm cursor-pointer font-medium text-neutral-500 hover:text-neutral-700"
          >
            Back
          </button>

          <button
            onClick={handleSubmit}
            disabled={!frontImage || !backImage || loading}
            className="rounded-xl cursor-pointer bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Request"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;
