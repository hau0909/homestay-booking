"use client";

import { X, Mail, Facebook, Apple } from "lucide-react";
import { useState } from "react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login:", { email, password });
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-sm text-[#328E6E] mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Your Email"
              className="w-full text-[#328E6E] px-4 py-3 border border-[#90C67C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#67AE6E]"
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm text-[#328E6E] mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Your Password"
              className="w-full text-[#328E6E] px-4 py-3 border border-[#90C67C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#67AE6E]"
              required
            />
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <button
              type="button"
              className="text-sm hover:cursor-pointer text-[#67AE6E] hover:text-[#328E6E] transition-colors"
            >
              Forgot Your Password?
            </button>
          </div>

          {/* Continue Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 hover:cursor-pointer py-3 bg-[#328E6E] text-white rounded-full font-medium hover:bg-[#67AE6E] transition-colors"
            >
              Continue
            </button>
            <button
              type="button"
              className="flex-1 hover:cursor-pointer py-3 border border-[#90C67C] text-[#328E6E] rounded-full font-medium hover:bg-[#90C67C] transition-colors flex items-center justify-center gap-2"
            >
              <Mail size={20} />
              Continue With Email
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
            className="flex-1 hover:cursor-pointer py-3 bg-[#67AE6E] text-[#E1EEBC] rounded-full font-medium hover:bg-[#328E6E] transition-colors flex items-center justify-center gap-2"
          >
            <img src="./facebook.png" alt="facebook icon" className="w-5 h-5" />
            Facebook
          </button>
          <button
            type="button"
            className="flex-1 hover:cursor-pointer py-3 bg-[#67AE6E] text-[#E1EEBC] rounded-full font-medium hover:bg-[#328E6E] transition-colors flex items-center justify-center gap-2"
          >
            <img src="./apple.png" alt="apple icon" className="w-5 h-5" />
            Apple ID
          </button>
          <button
            type="button"
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
