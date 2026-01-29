"use client";

import { X, Mail, Facebook, Apple } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { signUpWithVerifyEmail } from "@/src/services/auth/auth.service";
import { signInWithGoogle } from "@/src/services/auth/auth.service";
import { supabase } from "@/src/lib/supabase";
import { signInWithFacebook } from "@/src/services/auth/auth.service";
import {
  validateEmail,
  validatePasswordStrength,
  validatePasswordMatch,
} from "@/src/utils/validation";

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignUpModal({ isOpen, onClose }: SignUpModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Validation errors
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState<
    "weak" | "medium" | "strong" | ""
  >("");

  // Reset form khi modal đóng
  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setEmailError("");
      setPasswordError("");
      setConfirmPasswordError("");
      setPasswordStrength("");
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

  // Email blur handler to check if field is empty
  const handleEmailBlur = () => {
    if (!email || email.trim() === "") {
      setEmailError("Email is required");
    }
  };

  // Password validation handler
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);

    if (value) {
      const validation = validatePasswordStrength(value);
      setPasswordError(validation.valid ? "" : validation.error || "");
      // Luôn set strength để hiển thị progress bar
      setPasswordStrength(validation.strength || "");

      // Re-check confirm password if it has value
      if (confirmPassword) {
        const matchValidation = validatePasswordMatch(value, confirmPassword);
        setConfirmPasswordError(
          matchValidation.valid ? "" : matchValidation.error || "",
        );
      }
    } else {
      setPasswordError("Password is required");
      setPasswordStrength("");
    }
  };

  // Password blur handler
  const handlePasswordBlur = () => {
    if (!password || password.trim() === "") {
      setPasswordError("Password is required");
    }
  };

  // Confirm password validation handler
  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setConfirmPassword(value);

    if (value && password) {
      const validation = validatePasswordMatch(password, value);
      setConfirmPasswordError(validation.valid ? "" : validation.error || "");
    } else if (value) {
      setConfirmPasswordError("");
    } else {
      setConfirmPasswordError("Confirm password is required");
    }
  };

  // Confirm password blur handler
  const handleConfirmPasswordBlur = () => {
    if (!confirmPassword || confirmPassword.trim() === "") {
      setConfirmPasswordError("Confirm password is required");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate tất cả fields cùng lúc
    let hasError = false;

    // Check email
    if (!email || email.trim() === "") {
      setEmailError("Email is required");
      hasError = true;
    } else if (emailError) {
      hasError = true;
    }

    // Check password
    if (!password || password.trim() === "") {
      setPasswordError("Password is required");
      hasError = true;
    } else if (passwordError) {
      hasError = true;
    }

    // Check confirm password
    if (!confirmPassword || confirmPassword.trim() === "") {
      setConfirmPasswordError("Confirm password is required");
      hasError = true;
    } else if (confirmPasswordError) {
      hasError = true;
    }

    // Nếu có lỗi, hiển thị toast và return
    if (hasError) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    // Check password match
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await signUpWithVerifyEmail(email, password);

      toast.success("Please check your email to verify your account.", {
        duration: 5000,
        icon: "📩",
      });

      // Reset form and errors
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setEmailError("");
      setPasswordError("");
      setConfirmPasswordError("");
      setPasswordStrength("");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";

      // Xử lý các loại lỗi cụ thể
      if (
        errorMessage.includes("already registered") ||
        errorMessage.includes("already in use")
      ) {
        toast.error("This email is already registered. Please login instead.");
      } else if (errorMessage.includes("Password")) {
        toast.error(errorMessage.replace("❌ ", ""));
      } else {
        toast.error(errorMessage.replace("❌ ", ""));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      toast.error("Google sign up failed");
    }
  };

  const handleFacebookSignUp = async () => {
    try {
      await signInWithFacebook();
    } catch (error) {
      toast.error("Facebook sign up failed");
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
        <h2 className="text-2xl font-bold text-[#328E6E] mb-8">
          Create Your New Account
        </h2>

        {/* Form */}
        <form onSubmit={handleSignUp} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-sm text-[#328E6E] mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              placeholder="Enter Your Email"
              className={`w-full text-[#328E6E] px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                emailError
                  ? "border-red-500 focus:ring-red-500"
                  : email && !emailError
                    ? "border-green-500 focus:ring-green-500"
                    : "border-[#90C67C] focus:ring-[#67AE6E]"
              }`}
              required
              disabled={loading}
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
              placeholder="Enter Your Password (min 8 characters)"
              className={`w-full text-[#328E6E] px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                passwordError
                  ? "border-red-500 focus:ring-red-500"
                  : password && !passwordError
                    ? "border-green-500 focus:ring-green-500"
                    : "border-[#90C67C] focus:ring-[#67AE6E]"
              }`}
              required
              disabled={loading}
            />
            {passwordError && (
              <p className="text-red-500 text-sm mt-1">❌ {passwordError}</p>
            )}
            {password && passwordStrength && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      passwordStrength === "weak"
                        ? "w-1/3 bg-red-500"
                        : passwordStrength === "medium"
                          ? "w-2/3 bg-yellow-500"
                          : "w-full bg-green-500"
                    }`}
                  />
                </div>
                <span
                  className={`text-xs font-medium ${
                    passwordStrength === "weak"
                      ? "text-red-500"
                      : passwordStrength === "medium"
                        ? "text-yellow-600"
                        : "text-green-600"
                  }`}
                >
                  {passwordStrength.charAt(0).toUpperCase() +
                    passwordStrength.slice(1)}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-sm text-[#328E6E] mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              onBlur={handleConfirmPasswordBlur}
              placeholder="Confirm Your Password"
              className={`w-full text-[#328E6E] px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                confirmPasswordError
                  ? "border-red-500 focus:ring-red-500"
                  : confirmPassword && !confirmPasswordError
                    ? "border-green-500 focus:ring-green-500"
                    : "border-[#90C67C] focus:ring-[#67AE6E]"
              }`}
              required
              disabled={loading}
            />
            {confirmPasswordError && (
              <p className="text-red-500 text-sm mt-1">
                ❌ {confirmPasswordError}
              </p>
            )}
            {confirmPassword && !confirmPasswordError && (
              <p className="text-green-600 text-sm mt-1">✓ Passwords match</p>
            )}
          </div>

          {/* BUTTON WITH LOADING STATE */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3 text-white rounded-full font-medium transition-colors ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#328E6E] hover:bg-[#67AE6E] hover:cursor-pointer"
              }`}
            >
              {loading ? "Creating account..." : "Continue"}
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
            onClick={handleFacebookSignUp}
            className="flex-1 hover:cursor-pointer py-3 bg-[#67AE6E] text-[#E1EEBC] rounded-full font-medium hover:bg-[#328E6E] transition-colors flex items-center justify-center gap-2"
          >
            <img src="./facebook.png" alt="facebook icon" className="w-5 h-5" />
            Facebook
          </button>

          <button
            type="button"
            onClick={handleGoogleSignUp}
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
