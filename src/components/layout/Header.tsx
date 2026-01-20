"use client";

// components/Header.tsx
import { Menu, User, HouseHeart, Binoculars } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import SignUpModal from "../auth/SignUpModal";
import LoginModal from "../auth/LoginModal";

export default function Header() {
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

  return (
    <header className="w-full bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* LOGO */}
        {/* <img src="/logo.png" alt="logo" className="w-12 h-12" /> */}
        {/* NAVIGATION */}
        <nav className="hidden md:flex items-center gap-8 text-[#67AE6E] font-bold">
          <a
            href="#"
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
          <button className="rounded-full bg-[#328E6E] px-5 py-2 text-white font-medium hover:bg-[#67AE6E] transition hover:cursor-pointer">
            Become A Host
          </button>

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <div
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 rounded-full border bg-[#328E6E] border-[#67AE6E] p-2 text-black hover:cursor-pointer hover:bg-[#67AE6E] hover:boder-[#328E6E] transition-all duration-300"
            >
              <Menu size={18} />
              <div className="flex h-6 w-6 items-center justify-center rounded-full">
                <User size={18} className="text-white" />
              </div>
            </div>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#E1EEBC] rounded-lg shadow-lg py-2 z-50">
                <button
                  onClick={() => {
                    setIsSignUpModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:cursor-pointer text-[#328E6E] hover:text-[#67AE6E] hover:bg-[#90C67C] transition-colors"
                >
                  Sign Up
                </button>
                <button
                  onClick={() => {
                    setIsLoginModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left hover:cursor-pointer px-4 py-2 text-[#328E6E] hover:text-[#67AE6E] hover:bg-[#90C67C] transition-colors"
                >
                  Login
                </button>
                <a
                  href="#"
                  className="block px-4 py-2 text-[#328E6E] hover:text-[#67AE6E] hover:bg-[#90C67C] transition-colors"
                >
                  Help Center
                </a>
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
