"use client";
import React from "react";
import { useState } from "react";
import Link from "next/link";
import {
  resetPasswordRequest,
  checkEmailRegistered,
} from "@/src/services/auth/auth.service";
import toast from "react-hot-toast";

const Page = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailError("");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email.trim() === "") {
      setEmailError("Email is required");
      return;
    }

    if (!emailRegex.test(email)) {
      setEmailError("Invalid Email Format");
      return;
    }

    setLoading(true);
    try {
      const isRegistered = await checkEmailRegistered(email);

      if (!isRegistered) {
        setEmailError("This email is not registered. Please sign up first.");
        setLoading(false);
        return;
      }
      await resetPasswordRequest(email);
      toast.success("Please check your email!");
    } catch (error: any) {
      setEmailError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 shadow-sm p-8">
        {/* Title */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Forgot your password?
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Enter your registered email and we’ll send you a reset link.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-black">
              Email address
            </label>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full rounded-lg border px-4 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${emailError ? "border-red-500 focus:ring-red-500" : "border-gray-300"}`}
              disabled={loading}
              autoComplete="email"
            />
            {emailError && (
              <p className="text-red-500 text-xs mt-1">{emailError}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#328E6E] py-3 text-base font-semibold text-white shadow-sm hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-[#328E6E] hover:underline">
            Back to HomePage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Page;
