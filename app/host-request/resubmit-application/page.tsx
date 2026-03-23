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

  const handleSubmit = async () => {
    if (!frontImage || !backImage) return;

    try {
      setLoading(true);

      const frontUrl = await uploadIdentityCardFront(user.id, frontImage);
      const backUrl = await uploadIdentityCardBack(user.id, backImage);

      await sendBecomeHostRequest(user.id, frontUrl, backUrl);

      toast.success("Resubmitted successfully!");
      router.push("/become-host/pending-request");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-3xl bg-white border border-gray-200 rounded-3xl shadow-md p-8">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Resubmit Host Application
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Your previous application was rejected. Please fix your documents
            and submit again.
          </p>
        </div>

        {/* WARNING */}
        <div className="mb-6 rounded-xl bg-blue-50 border border-blue-200 p-4 text-blue-800 text-sm">
          ⚠️ Make sure your ID images are clear, not blurry, and fully visible.
        </div>

        {/* UPLOAD */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* FRONT */}
          <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50">
            <p className="font-medium text-gray-700 mb-3">Front ID Card</p>

            {frontImage ? (
              <div className="relative group">
                <img
                  src={URL.createObjectURL(frontImage)}
                  className="w-full h-44 object-cover rounded-xl"
                />
                <button
                  onClick={() => setFrontImage(null)}
                  className="absolute top-2 right-2 bg-white/90 backdrop-blur px-3 py-1 text-xs rounded-full shadow hover:bg-white"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex h-44 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white hover:bg-gray-100 transition-all duration-200">
                <span className="text-3xl">📤</span>
                <p className="text-sm text-gray-600 mt-2">Upload front image</p>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files?.[0] && setFrontImage(e.target.files[0])
                  }
                />
              </label>
            )}
          </div>

          {/* BACK */}
          <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50">
            <p className="font-medium text-gray-700 mb-3">Back ID Card</p>

            {backImage ? (
              <div className="relative group">
                <img
                  src={URL.createObjectURL(backImage)}
                  className="w-full h-44 object-cover rounded-xl"
                />
                <button
                  onClick={() => setBackImage(null)}
                  className="absolute top-2 right-2 bg-white/90 backdrop-blur px-3 py-1 text-xs rounded-full shadow hover:bg-white"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex h-44 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white hover:bg-gray-100 transition-all duration-200">
                <span className="text-3xl">📤</span>
                <p className="text-sm text-gray-600 mt-2">Upload back image</p>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files?.[0] && setBackImage(e.target.files[0])
                  }
                />
              </label>
            )}
          </div>
        </div>

        {/* ACTION */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-500 hover:text-gray-700 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={!frontImage || !backImage || loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Resubmit Application"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;
