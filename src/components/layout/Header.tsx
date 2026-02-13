"use client";

// components/Header.tsx
import {
  Menu,
  User,
  HouseHeart,
  Binoculars,
  LayoutDashboard,
  Home,
  ListOrdered,
  CalendarCheck,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import SignUpModal from "../auth/SignUpModal";
import LoginModal from "../auth/LoginModal";
import { useAuth } from "@/src/hooks/useAuth";
import { logoutUser } from "@/src/services/auth/auth.service";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getHostStatus } from "@/src/services/host/getHostStatus.service";
import { usePathname } from "next/navigation";

export default function Header() {
  const { user, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [mode, setMode] = useState<"travelling" | "host">("host");
  const [host, setHost] = useState<boolean | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const isHostMode = host && mode === "host";
  const pathname = usePathname();

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
      if (user?.id) {
        localStorage.removeItem(`profile_${user.id}`);
      }

      await logoutUser();
      toast.success("Logged out successfully");
      setHost(false);
      setIsMenuOpen(false);

      router.push("/");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    const checkHostStatus = async () => {
      try {
        const status = await getHostStatus(user.id);
        setHost(status);

        if (status && pathname === "/") {
          router.replace("/hosting");
        }
      } catch (error) {
        console.log(error);
      }
    };

    checkHostStatus();
  }, [user?.id]);

  const handleBecomeHost = () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    router.push("/become-host/sendRequestHost");
  };

  const handleHostMode = () => {
    setMode("host");
    router.push("/hosting");
  };

  const handleTravellingMode = () => {
    setMode("travelling");
    router.push("/");
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
        {isHostMode ? (
          <>
            {/* HOST MODE */}
            <nav className="hidden md:flex items-center gap-8 text-[#67AE6E] font-bold">
              <Link
                href="/hosting"
                className="flex items-center gap-2 transition-transform duration-300 hover:scale-110"
              >
                <LayoutDashboard size={30} />
                Dashboard
              </Link>
              <Link
                href="/hosting/listing"
                className="flex items-center gap-2 transition-transform duration-300 hover:scale-110"
              >
                <Home size={30} />
                Listing
              </Link>
              <Link
                href="/hosting/bookings"
                className="flex items-center gap-2 transition-transform duration-300 hover:scale-110"
              >
                <ListOrdered size={30} />
                Bookings order
              </Link>
              <Link
                href="/hosting/calendar"
                className="flex items-center gap-2 transition-transform duration-300 hover:scale-110"
              >
                <CalendarCheck size={30} />
                Calendar
              </Link>
            </nav>
          </>
        ) : (
          <>
            <nav className="hidden md:flex items-center gap-8 text-[#67AE6E] font-bold">
              <Link
                href="/"
                className="flex items-center gap-2 transition-transform duration-300 hover:scale-110"
              >
                <HouseHeart size={30} />
                Homestay
              </Link>
              <Link
                href="#"
                className="flex items-center gap-2 transition-transform duration-300 hover:scale-110"
              >
                <Binoculars size={30} />
                Experiences
              </Link>
            </nav>
          </>
        )}

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-4">
          {host ? (
            <button
              onClick={mode === "host" ? handleTravellingMode : handleHostMode}
              className="cursor-pointer rounded-full bg-[#328E6E] px-5 py-3 text-white font-medium hover:bg-[#67AE6E] transition"
            >
              {mode === "host" ? "Switch to Travelling" : "Switch to Hosting"}
            </button>
          ) : (
            <button
              onClick={handleBecomeHost}
              className="cursor-pointer rounded-full bg-[#328E6E] px-5 py-3 text-white font-medium hover:bg-[#67AE6E] transition"
            >
              Become a Host
            </button>
          )}

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
                      href="/profile"
                      className="block px-4 py-2 text-[#328E6E] hover:text-[#67AE6E] hover:bg-gray-200 transition-colors"
                    >
                      My Profile
                    </a>
                    <a
                      href="/bookings"
                      className="block px-4 py-2 text-[#328E6E] hover:text-[#67AE6E] hover:bg-gray-200 transition-colors"
                    >
                      My Bookings
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
