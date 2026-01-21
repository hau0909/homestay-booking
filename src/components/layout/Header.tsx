"use client";

// components/Header.tsx
import { Menu, User } from "lucide-react";
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
    <header className="w-full bg-gray-100">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* LOGO */}
        <div className="text-2xl font-bold text-gray-800">LOGO</div>

        {/* NAVIGATION */}
        <nav className="hidden md:flex items-center gap-8 text-black font-bold">
          <a
            href="#"
            className="relative hover:text-gray-900 transition-colors after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-0.5 after:bg-black after:transition-all after:duration-300 hover:after:w-full"
          >
            Find a Property
          </a>
          <a
            href="#"
            className="relative hover:text-gray-900 transition-colors after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-0.5 after:bg-black after:transition-all after:duration-300 hover:after:w-full"
          >
            Share Stories
          </a>
          <a
            href="#"
            className="relative hover:text-gray-900 transition-colors after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-0.5 after:bg-black after:transition-all after:duration-300 hover:after:w-full"
          >
            Rental Guides
          </a>
        </nav>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-4">
          {/* Become Host */}
          <button className="rounded-full bg-black px-5 py-2 text-white font-medium hover:bg-gray-800 transition hover:cursor-pointer">
            Become A Host
          </button>

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <div
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 rounded-full border border-gray-300 p-2 text-black hover:cursor-pointer hover:bg-gray-300 hover:boder-gray-300 transition-all duration-300"
            >
              <Menu size={18} />
              <div className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-gray-200">
                <User size={18} className="text-gray-600" />
              </div>
            </div>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                <button
                  onClick={() => {
                    setIsSignUpModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-100 transition-colors"
                >
                  Sign Up
                </button>
                <button
                  onClick={() => {
                    setIsLoginModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-100 transition-colors"
                >
                  Login
                </button>
                <a
                  href="#"
                  className="block px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-100 transition-colors"
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
