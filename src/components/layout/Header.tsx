/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

// components/Header.tsx
import { Menu, User, HouseHeart, Binoculars } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import SignUpModal from "../auth/SignUpModal";
import LoginModal from "../auth/LoginModal";
import { useAuth } from "@/src/hooks/useAuth";
import { logoutUser } from "@/src/services/auth/auth.service";
import toast from "react-hot-toast";

export default function Header() {
  const { user, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success("Logged out successfully");
      setIsMenuOpen(false);
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const getInitial = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <header className="w-full bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* LOGO */}
        {/* <img src="/logo.png" alt="logo" className="w-12 h-12" /> */}
        {/* NAVIGATION */}
        <nav className="hidden md:flex items-center gap-8 text-[#67AE6E] font-bold">
          <a
            href="/"
            className="flex items-center gap-2 transition-transform duration-300 hover:scale-110"
          >
            <HouseHeart size={30} />
            Homestay
          </a>
          <a
            href="#"
            className="flex items-center gap-2 transition-transform duration-300 hover:scale-110"
          >
            <Binoculars size={30} />
            Experiences
          </a>
        </nav>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-4">
          {/* Become Host */}
          <button className="rounded-full bg-[#328E6E] px-5 py-3 text-white font-medium hover:bg-[#67AE6E] transition hover:cursor-pointer">
            Become A Host
          </button>

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            {/* User Menu Icon */}
            <div
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 rounded-full border bg-[#328E6E] border-[#67AE6E] p-2 hover:cursor-pointer hover:bg-[#67AE6E] transition-all duration-300"
            >
              <Menu size={18} />

              {user ? (
                user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="User avatar"
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-gray-400 flex items-center justify-center text-white text-sm font-semibold">
                    {getInitial(user.email ?? "U")}
                  </div>
                )
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#67AE6E]">
                  <User size={18} className="text-white" />
                </div>
              )}
            </div>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50">
                {/* Nếu user đã login */}
                {user ? (
                  <>
                    {/* User Info */}
                    <div className="px-4 py-2 border-b border-[#90C67C]">
                      <p className="text-sm font-semibold text-[#328E6E] truncate">
                        {user.email}
                      </p>
                      <p className="text-xs text-[#67AE6E]">
                        {user.user_metadata?.full_name || "User"}
                      </p>
                    </div>

                    {/* Menu Items cho user đã login */}
                    <a
                      href="#"
                      className="block px-4 py-2 text-[#328E6E] hover:text-[#67AE6E] hover:bg-gray-200 transition-colors"
                    >
                      My Profile
                    </a>
                    <a
                      href="#"
                      className="block px-4 py-2 text-[#328E6E] hover:text-[#67AE6E] hover:bg-gray-200 transition-colors"
                    >
                      Account Setting
                    </a>

                    <div className="border-t border-[#90C67C] my-2"></div>

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="block w-full hover:cursor-pointer text-left px-4 py-2 text-red-600 hover:bg-gray-200 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    {/* Menu Items cho guest */}
                    <button
                      onClick={() => {
                        setIsSignUpModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left hover:cursor-pointer px-4 py-2 text-[#328E6E] hover:text-[#67AE6E] hover:bg-gray-200 transition-colors"
                    >
                      Sign Up
                    </button>
                    <button
                      onClick={() => {
                        setIsLoginModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left hover:cursor-pointer px-4 py-2 text-[#328E6E] hover:text-[#67AE6E] hover:bg-gray-200 transition-colors"
                    >
                      Login
                    </button>
                    <a
                      href="#"
                      className="block px-4 py-2 text-[#328E6E] hover:text-[#67AE6E] hover:bg-gray-200 transition-colors"
                    >
                      Help Center
                    </a>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sign Up Modal */}
      <SignUpModal
        isOpen={isSignUpModalOpen}
        onClose={() => setIsSignUpModalOpen(false)}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </header>
  );
}
