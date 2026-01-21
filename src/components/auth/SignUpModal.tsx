"use client";

import { X, Mail, Facebook, Apple } from "lucide-react";
import { useState } from "react";

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignUpModal({ isOpen, onClose }: SignUpModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Sign up:", { email, password });
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
          className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Login or Signup
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-sm text-black mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Your Email"
              className="w-full text-black px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400"
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm text-black mb-2 ">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Your Password"
              className="w-full text-black px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400"
              required
            />
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-sm text-black mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Your Password"
              className="w-full text-black px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400"
              required
            />
          </div>

          {/* Continue Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 hover:cursor-pointer py-3 bg-gray-600 text-white rounded-full font-medium hover:bg-gray-700 transition-colors"
            >
              Continue
            </button>
            <button
              type="button"
              className="flex-1 hover:cursor-pointer py-3 border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              <Mail size={20} />
              Continue With Email
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">
              Or Continue With
            </span>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            className="flex-1 hover:cursor-pointer py-3 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <Facebook size={20} />
            Facebook
          </button>
          <button
            type="button"
            className="flex-1 hover:cursor-pointer py-3 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <Apple size={20} />
            Apple ID
          </button>
          <button
            type="button"
            className="flex-1 hover:cursor-pointer py-3 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>
        </div>
      </div>
    </div>
  );
}
