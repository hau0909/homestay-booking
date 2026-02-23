"use client";

import { X, Mail, Facebook, Apple } from "lucide-react";
import React, { useState, useEffect } from "react";
import { loginUser } from "@/src/services/auth/auth.service";
import { signInWithGoogle } from "@/src/services/auth/auth.service";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { signInWithFacebook } from "@/src/services/auth/auth.service";
import { validateEmail } from "@/src/utils/validation";
import Link from "next/link";
import { getHostStatus } from "@/src/services/host/getHostStatus.service";
import { getUser } from "@/src/services/profile/getUserProfile";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Validation errors
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Reset form khi modal đóng
  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setPassword("");
      setEmailError("");
      setPasswordError("");
    }
  }, [isOpen]);

  // Email validation handler
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    if (value) {
      const validation = validateEmail(value);
      setEmailError(validation.valid ? "" : validation.error || "");
    } else {
      setEmailError("Email is required");
    }
  };

  // Email blur handler
  const handleEmailBlur = () => {
    if (!email || email.trim() === "") {
      setEmailError("Email is required");
    }
  };

  // Password validation handler
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);

    if (!value || value.trim() === "") {
      setPasswordError("Password is required");
    } else {
      setPasswordError("");
    }
  };

  // Password blur handler
  const handlePasswordBlur = () => {
    if (!password || password.trim() === "") {
      setPasswordError("Password is required");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate tất cả fields
    let hasError = false;

    if (!email || email.trim() === "") {
      setEmailError("Email is required");
      hasError = true;
    } else if (emailError) {
      hasError = true;
    }

    if (!password || password.trim() === "") {
      setPasswordError("Password is required");
      hasError = true;
    } else if (passwordError) {
      hasError = true;
    }

    if (hasError) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    try {
      setLoading(true);

      await loginUser(email, password);

      const isHost = await getHostStatus();

      toast.success("Login successfully");
      onClose();
      if (isHost) {
        router.replace("/hosting");
      } else {
        router.replace("/");
      }
      setEmail("");
      setPassword("");
      setEmailError("");
      setPasswordError("");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login Failed";

      if (errorMessage.includes("Invalid email or password")) {
        toast.error("Invalid email or password. Please try again.");
      } else if (errorMessage.includes("verify your email")) {
        toast.error("Please verify your email before logging in.");
      } else {
        console.log(error);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      toast.error("Google sign in failed");
    }
  };

  const handleFacebookLogin = async () => {
    try {
      await signInWithFacebook();
    } catch (error) {
      toast.error("Facebook sign in failed");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-xl p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-[#67AE6E] hover:text-[#328E6E] transition-colors"
        >
          <X size={24} />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-[#328E6E] mb-8">Welcome Back</h2>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-sm text-[#328E6E] mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              disabled={loading}
              placeholder="Enter Your Email"
              className={`w-full text-[#328E6E] px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                emailError
                  ? "border-red-500 focus:ring-red-500"
                  : email && !emailError
                    ? "border-green-500 focus:ring-green-500"
                    : "border-[#90C67C] focus:ring-[#67AE6E]"
              }`}
              required
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-1">❌ {emailError}</p>
            )}
            {email && !emailError && (
              <p className="text-green-600 text-sm mt-1">✓ Valid email</p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm text-[#328E6E] mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              onBlur={handlePasswordBlur}
              disabled={loading}
              placeholder="Enter Your Password"
              className={`w-full text-[#328E6E] px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                passwordError
                  ? "border-red-500 focus:ring-red-500"
                  : password && !passwordError
                    ? "border-green-500 focus:ring-green-500"
                    : "border-[#90C67C] focus:ring-[#67AE6E]"
              }`}
              required
            />
            {passwordError && (
              <p className="text-red-500 text-sm mt-1">❌ {passwordError}</p>
            )}
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link
              href="/auth/forgot-password"
              onClick={onClose}
              className="text-sm hover:cursor-pointer text-[#67AE6E] hover:text-[#328E6E] transition-colors"
            >
              Forgot Your Password?
            </Link>
          </div>

          {/* Continue Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading} // ⚠️ THIẾU
              className={`flex-1 py-3 text-white rounded-full font-medium transition-colors ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#328E6E] hover:bg-[#67AE6E] hover:cursor-pointer"
              }`}
            >
              {loading ? "Logging in..." : "Continue"}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#90C67C]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-[#67AE6E]">
              Or Continue With
            </span>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleFacebookLogin}
            className="flex-1 hover:cursor-pointer py-3 bg-[#67AE6E] text-[#E1EEBC] rounded-full font-medium hover:bg-[#328E6E] transition-colors flex items-center justify-center gap-2"
          >
            <img src="./facebook.png" alt="facebook icon" className="w-5 h-5" />
            Facebook
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex-1 hover:cursor-pointer py-3 bg-[#67AE6E] text-[#E1EEBC] rounded-full font-medium hover:bg-[#328E6E] transition-colors flex items-center justify-center gap-2"
          >
            <img src="./google.png" alt="google icon" className="w-5 h-5" />
            Google
          </button>
        </div>
      </div>
    </div>
  );
}
