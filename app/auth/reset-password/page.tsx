"use client";
import React from "react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { updatePassword, logoutUser } from "@/src/services/auth/auth.service";
import { useRouter } from "next/navigation";
import {
  validatePasswordStrength,
  validatePasswordMatch,
} from "@/src/utils/validation";
import { supabase } from "@/src/lib/supabase";

const Page = () => {
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [lodaing, setLoading] = useState(false);
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const verifyLinkEmail = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        setStatus("error");
        setErrorMessage(
          "This password reset link is invalid or has expired. Please request a new one.",
        );
        return;
      }

      setStatus("success");
    };

    verifyLinkEmail();
  }, []);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    const validation = validatePasswordStrength(value);
    setPasswordError(
      validation.valid ? "" : validation.error || "Invalid password",
    );
    // Also validate confirm password if it has value
    if (newPassword) {
      const matchValidation = validatePasswordMatch(value, newPassword);
      setConfirmError(
        matchValidation.valid
          ? ""
          : matchValidation.error || "Passwords do not match",
      );
    }
  };

  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPassword(value);
    if (!value || value.trim() === "") {
      setConfirmError("Please confirm your password");
    } else {
      const matchValidation = validatePasswordMatch(password, value);
      setConfirmError(
        matchValidation.valid
          ? ""
          : matchValidation.error || "Passwords do not match",
      );
    }
  };

  useEffect(() => {});
  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Đã validate realtime, chỉ check lại trước khi submit
    if (passwordError || confirmError || !password || !newPassword) return;
    try {
      setLoading(true);
      await updatePassword(password);
      toast.success("Reset password successfully!");
      await logoutUser();
      router.push("/");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="max-w-md w-full rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <span className="text-2xl">⚠️</span>
          </div>

          <h1 className="text-xl font-semibold text-gray-900">
            Reset link invalid
          </h1>

          <p className="mt-2 text-sm text-gray-500">{errorMessage}</p>

          <a
            href="/auth/forgot-password"
            className="mt-6 inline-block rounded-lg bg-[#328E6E] px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition"
          >
            Request new reset link
          </a>
        </div>
      </div>
    );
  }
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
          <p className="text-sm text-gray-500">Verifying your reset link...</p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-100 shadow-sm p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <span className="text-2xl">🏡</span>
            </div>

            <h1 className="text-2xl font-semibold text-gray-900">
              Reset your password
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Create a new password to continue your journey with
              <span className="font-medium text-gray-700">
                {" "}
                Homestay Booking
              </span>
              .
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleResetPassword} className="space-y-5">
            {/* New password */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                New password
              </label>
              <input
                type="password"
                placeholder="At least 8 characters, 1 uppercase, 1 number"
                value={password}
                onChange={handlePasswordChange}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${passwordError ? "border-red-500 focus:ring-red-500" : "border-gray-300"}`}
                disabled={lodaing}
                autoComplete="new-password"
              />
              {passwordError && (
                <p className="text-red-500 text-xs mt-1">{passwordError}</p>
              )}
            </div>
            {/* Confirm password */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <input
                type="password"
                placeholder="Re-enter your new password"
                value={newPassword}
                onChange={handleConfirmChange}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${confirmError ? "border-red-500 focus:ring-red-500" : "border-gray-300"}`}
                disabled={lodaing}
                autoComplete="new-password"
              />
              {confirmError && (
                <p className="text-red-500 text-xs mt-1">{confirmError}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={lodaing}
              className="w-full rounded-lg bg-[#328E6E] py-3 text-base font-semibold text-white shadow-sm hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              {lodaing ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    );
  }
};

export default Page;
