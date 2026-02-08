"use client";
import React from "react";
import { useState } from "react";
import {
  changePassword,
  checkCurrentPassword,
} from "@/src/services/profile/profile.service";
import toast from "react-hot-toast";
import {
  validatePasswordMatch,
  validatePasswordStrength,
} from "@/src/utils/validation";
import { logoutUser } from "@/src/services/auth/auth.service";
import { useRouter } from "next/navigation";

const Page = () => {
  const [currentpassword, setCurrentpassword] = useState("");
  const [newpassword, setNewpassword] = useState("");
  const [confirmNewpassword, setConfirmNewpassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentpassworderror, setCurrentpasswordError] = useState("");
  const [newpassworderror, setNewpasswordError] = useState("");
  const [confirmNewpassworderror, setConfirmNewpassworderror] = useState("");
  const router = useRouter();

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (currentpassworderror || newpassworderror || confirmNewpassworderror) {
      toast.error("Please fix the errors first");
      return;
    }

    try {
      setLoading(true);

      const isValid = await checkCurrentPassword(currentpassword);

      if (!isValid) {
        toast.error("Current password does not match");
        return;
      }
      await changePassword(newpassword);
      toast.success("Change password successfully");
      await logoutUser();
      router.push("/");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleNewPasswordChange = (value: string) => {
    setNewpassword(value);

    const passwordStrenght = validatePasswordStrength(value);

    if (!passwordStrenght.valid) {
      setNewpasswordError(passwordStrenght.error || "");
    } else {
      setNewpasswordError("");
    }
  };

  const handleCurrentPasswordChange = (value: string) => {
    setCurrentpassword(value);

    if (value.trim() == "") {
      setCurrentpasswordError("Current password is required!");
    } else {
      setCurrentpasswordError("");
    }
  };

  const handleConfirmNewPasswordChange = (value: string) => {
    setConfirmNewpassword(value);

    const confirmNewPasswords = validatePasswordMatch(newpassword, value);

    if (value.trim() == "") {
      setConfirmNewpassworderror("Confirm new password is required!");
      return;
    }

    if (!confirmNewPasswords.valid) {
      setConfirmNewpassworderror(confirmNewPasswords.error || "");
    } else {
      setConfirmNewpassworderror("");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 shadow-sm p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <span className="text-2xl">🏡</span>
          </div>

          <h1 className="text-2xl font-semibold text-gray-900">
            Change your password
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Change a new password to continue your journey with
            <span className="font-medium text-gray-700"> Homestay Booking</span>
            .
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleChangePassword} className="space-y-5">
          {/* New password */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Current password
            </label>
            <input
              type="password"
              value={currentpassword}
              onChange={(e) => handleCurrentPasswordChange(e.target.value)}
              placeholder="Enter your current password"
              className={`w-full rounded-lg border px-4 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 `}
              autoComplete="new-password"
            />
            {currentpassworderror && (
              <p className="text-sm text-red-500">{currentpassworderror}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              New password
            </label>
            <input
              type="password"
              value={newpassword}
              onChange={(e) => handleNewPasswordChange(e.target.value)}
              placeholder="Enter your new password"
              className={`w-full rounded-lg border px-4 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 `}
              autoComplete="new-password"
            />
            {newpassworderror && (
              <p className="text-sm text-red-500">{newpassworderror}</p>
            )}
          </div>

          {/* Confirm password */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Confirm new password
            </label>
            <input
              type="password"
              value={confirmNewpassword}
              onChange={(e) => handleConfirmNewPasswordChange(e.target.value)}
              placeholder="Confirm your new password"
              className={`w-full rounded-lg border px-4 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 `}
              autoComplete="new-password"
            />
            {confirmNewpassworderror && (
              <p className="text-sm text-red-500">{confirmNewpassworderror}</p>
            )}
          </div>
          <button
            disabled={loading}
            type="submit"
            className="w-full rounded-lg bg-[#328E6E] py-3 text-base font-semibold text-white shadow-sm hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            {loading ? "Changing..." : " Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Page;
