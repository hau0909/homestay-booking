"use client";
import React from "react";
import { isProfileCompleted } from "@/src/services/host/checkProfiile.service";
import { useState, useEffect } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { useRouter } from "next/navigation";

const Page = () => {
  const [completed, setCompleted] = useState<boolean | null>(null);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const checkProfileCompleted = async () => {
      const checkCompleted = await isProfileCompleted(user.id);
      setCompleted(checkCompleted);
    };
    checkProfileCompleted();
  }, [user]);

  if (loading || completed === null) {
    return <div>loading</div>;
  }

  return (
    <div>
      {completed ? (
        <>
          <div className="mx-auto max-w-2xl rounded-3xl border border-neutral-200 bg-white p-8 shadow-md mb-32 mt-20">
            {/* Step indicator */}
            <div className="mb-6 flex items-center gap-3">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                Step 1 of 2
              </span>
              <span className="text-sm text-neutral-500">Host application</span>
            </div>

            {/* Header */}
            <div className="mb-4 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                ✨
              </div>

              <div>
                <h2 className="text-xl font-semibold text-neutral-900">
                  Your profile is ready
                </h2>
                <p className="mt-1 text-sm text-neutral-600">
                  Great job! Your information has been successfully completed.
                </p>
              </div>
            </div>

            {/* Content */}
            <p className="mb-8 leading-relaxed text-neutral-600">
              You can now continue to the next step and submit your request to
              become a host. Our team will review your application shortly after
              submission.
            </p>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.push("/")}
                className="text-sm cursor-pointer font-medium text-neutral-500 hover:text-neutral-700"
              >
                Cancel
              </button>

              <button
                onClick={() => router.push("/become-host/verify")}
                className="rounded-xl cursor-pointer bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Continue
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="mx-auto max-w-2xl rounded-3xl border border-neutral-200 bg-white p-8 shadow-md mb-32 mt-20">
            {/* Step indicator */}
            <div className="mb-6 flex items-center gap-3">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                Step 1 of 2
              </span>
              <span className="text-sm text-neutral-500">Host application</span>
            </div>

            {/* Header */}
            <div className="mb-4 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                🏡
              </div>

              <div>
                <h2 className="text-xl font-semibold text-neutral-900">
                  Complete your profile
                </h2>
                <p className="mt-1 text-sm text-neutral-600">
                  Guests prefer hosts with clear and verified information.
                </p>
              </div>
            </div>

            {/* Content */}
            <p className="mb-6 leading-relaxed text-neutral-600">
              Before submitting your host application, please make sure your
              personal profile is fully completed. This helps build trust and
              ensures a smoother approval process.
            </p>

            {/* Checklist */}
            <ul className="mb-8 space-y-3 text-sm text-neutral-700">
              <li className="flex items-center gap-2">✅ Full name & avatar</li>
              <li className="flex items-center gap-2">✅ Phone number</li>
              <li className="flex items-center gap-2">
                ✅ Identity information
              </li>
            </ul>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.push("/")}
                className="text-sm cursor-pointer font-medium text-neutral-500 hover:text-neutral-700"
              >
                Cancel
              </button>

              <button
                onClick={() => router.push("/profile")}
                className="rounded-xl cursor-pointer hover:bg-gray-800 bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition"
              >
                Complete profile
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Page;
