"use client";
import React from "react";
import { useEffect, useState } from "react";
import { getUserHostApplication } from "@/src/services/host/getUserHostApplication";
import { useAuth } from "@/src/hooks/useAuth";
import { getUserProfile } from "@/src/services/profile/getUserProfile";
import { Profile } from "@/src/types/profile";
import { requestToSendApplicationAgain } from "@/src/services/host/requestAgain";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Page() {
  const { user } = useAuth();
  const [application, setApplication] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const appData = await getUserHostApplication(user.id);
          setApplication(appData[0] || null);

          const profileData = await getUserProfile(user.id);
          setProfile(profileData);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const handleRequestAgain = async () => {
    if (!user || !application) return;

    try {
      await requestToSendApplicationAgain(application.id);

      setApplication((prev: any) =>
        prev ? { ...prev, status: "request_again" } : prev,
      );
      setShowConfirm(false);
      toast.success("Send request successfully");
    } catch (error: any) {
      toast.error(error);
    }
  };

  if (loading) {
    return <div className="loader"></div>;
  }

  if (!application) {
    return (
      <div className="mb-50 mt-50 flex justify-center items-center">
        {" "}
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Host Application</h1>

          <div>
            {" "}
            {application.status === "rejected" && (
              <span className="bg-red-100 text-red-500 py-2 px-3 text-sm font-bold rounded-3xl">
                REJECTED
              </span>
            )}
            {application.status === "approved" && (
              <span className="bg-green-100 text-green-500 py-2 px-3 text-sm font-bold rounded-3xl">
                APPROVED
              </span>
            )}
            {application.status === "pending" && (
              <span className="bg-yellow-100 text-yellow-500 py-2 px-3 text-sm font-bold rounded-3xl">
                PENDING
              </span>
            )}
            {application.status === "resubmit" && (
              <span className="bg-blue-100 text-blue-500 py-2 px-3 text-sm font-bold rounded-3xl">
                RESUBMIT
              </span>
            )}
            {application.status === "request_again" && (
              <span className="bg-purple-100 text-purple-500 py-2 px-3 text-sm font-bold rounded-3xl">
                REQUEST
              </span>
            )}
          </div>
        </div>

        {/* INFO */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Full Name</p>
            <p className="font-semibold">{profile?.full_name}</p>
          </div>

          <div>
            <p className="text-gray-500">Created</p>
            <p className="font-semibold">
              {new Date(application.created_at).toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Updated</p>
            <p className="font-semibold">
              {new Date(application.updated_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* IMAGE */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* FRONT */}
          <div className="group relative rounded-2xl overflow-hidden shadow-md border bg-white">
            {/* LABEL */}
            <div className="absolute top-2 left-2 z-10 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
              Front
            </div>

            {/* IMAGE */}
            <img
              src={application.identity_card_front_url}
              alt="Front document"
              className="w-full h-44 object-cover transition duration-300 group-hover:scale-105"
            />

            {/* OVERLAY */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
          </div>

          {/* BACK */}
          <div className="group relative rounded-2xl overflow-hidden shadow-md border bg-white">
            {/* LABEL */}
            <div className="absolute top-2 left-2 z-10 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
              Back
            </div>

            {/* IMAGE */}
            <img
              src={application.identity_card_back_url}
              alt="Back document"
              className="w-full h-44 object-cover transition duration-300 group-hover:scale-105"
            />

            {/* OVERLAY */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
          </div>
        </div>

        {/* STATUS MESSAGE */}
        <div className="mt-6">
          {application.status === "pending" && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-xl">
              ⏳ Waiting for admin approval...
            </div>
          )}

          {application.status === "rejected" && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
              ❌ Your application was rejected.
            </div>
          )}

          {application.status === "request_again" && (
            <div className="bg-purple-50 border border-purple-200 text-purple-700 p-4 rounded-xl">
              🔁 Waiting admin allow...
            </div>
          )}
          {application.status === "approved" && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl">
              🎉 You are now a host!
            </div>
          )}
        </div>

        {/* ACTION */}
        <div className="mt-6">
          {application.status === "rejected" && (
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors duration-300 cursor-pointer"
            >
              Request Again
            </button>
          )}

          {application.status === "resubmit" && (
            <button
              onClick={() => router.push("/host-request/resubmit-application")}
              className="w-full bg-blue-300 text-blue-600 py-3 rounded-xl hover:bg-blue-400 transition-colors duration-300 cursor-pointer"
            >
              Edit Application
            </button>
          )}

          {application.status === "approved" && (
            <button
              onClick={() => router.push("/hosting")}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium transition-colors duration-300 cursor-pointer"
            >
              Go to Host Dashboard
            </button>
          )}
        </div>
        {showConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
              {/* TITLE */}
              <h2 className="text-lg font-semibold mb-2">Confirm Request</h2>

              {/* CONTENT */}
              <p className="text-gray-600 mb-4">
                Are you sure you want to request again? This will send a request
                to admin.
              </p>

              {/* ACTIONS */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 cursor-pointer transition-colors duration-300"
                >
                  Cancel
                </button>

                <button
                  onClick={handleRequestAgain}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transition-colors duration-300"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
