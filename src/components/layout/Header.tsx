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
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import SignUpModal from "../auth/SignUpModal";
import LoginModal from "../auth/LoginModal";
import { useAuth } from "@/src/hooks/useAuth";
import { logoutUser } from "@/src/services/auth/auth.service";
import { getUserProfile } from "@/src/services/profile/getUserProfile";
import { becomeHost } from "@/src/services/host/becomeHost";
import { Profile } from "@/src/types/profile";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Header() {
  const { user, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [switching, setSwitching] = useState(false);
  const [currentViewMode, setCurrentViewMode] = useState<"traveller" | "host">(
    () => {
      // Khởi tầo từ localStorage hoặc check URL
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("viewMode");
        if (saved === "host" && window.location.pathname.startsWith("/host")) {
          return "host";
        }
      }
      return "traveller";
    },
  );
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // Thử load từ cache trước
      const cachedProfile = localStorage.getItem(`profile_${user.id}`);
      if (cachedProfile) {
        try {
          setProfile(JSON.parse(cachedProfile));
        } catch (e) {
          // Invalid cache, ignore
        }
      }

      // Fetch fresh data
      getUserProfile(user.id).then((profileData) => {
        setProfile(profileData);
        // Cache profile
        if (profileData) {
          localStorage.setItem(
            `profile_${user.id}`,
            JSON.stringify(profileData),
          );
        }
      });
    } else {
      setProfile(null);
      setCurrentViewMode("traveller");
      localStorage.removeItem("viewMode");
    }
  }, [user, router]);

  // // Auto-detect mode dựa trên URL
  useEffect(() => {
    if (typeof window !== "undefined" && user) {
      // Chỉ auto-detect khi user đã login
      const isHostPath = window.location.pathname.startsWith("/host");
      if (isHostPath && profile?.is_host) {
        // Nếu đang ở /host/* path VÀ có quyền host
        setCurrentViewMode("host");
        localStorage.setItem("viewMode", "host");
      } else if (!isHostPath) {
        // Nếu không ở /host/* path, set traveller mode
        setCurrentViewMode("traveller");
        localStorage.setItem("viewMode", "traveller");
      }
    } else if (!user) {
      // Nếu không có user (logged out), force traveller mode
      setCurrentViewMode("traveller");
      localStorage.removeItem("viewMode");
    }
  }, [profile, router, user]); // Thêm user vào dependencies

  const handleToggleHostMode = async () => {
    // Nếu chưa login → hiển thị modal login
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    if (!profile) return;

    // Nếu chưa có quyền host, cần enable host trong DB
    if (!profile.is_host) {
      try {
        setSwitching(true);
        await becomeHost(true);

        // Optimistic update profile ngay lập tức
        const optimisticProfile = { ...profile, is_host: true };
        setProfile(optimisticProfile);

        // Cache ngay lập tức
        localStorage.setItem(
          `profile_${user.id}`,
          JSON.stringify(optimisticProfile),
        );

        setCurrentViewMode("host");
        localStorage.setItem("viewMode", "host");
        toast.success("Switched to Host mode");
        router.push("/hosting");

        // Background fetch để sync với server
        getUserProfile(user.id).then((updated) => {
          setProfile(updated);
          if (updated) {
            localStorage.setItem(`profile_${user.id}`, JSON.stringify(updated));
          }
        });
      } catch (error) {
        toast.error("Failed to switch mode");
      } finally {
        setSwitching(false);
      }
    } else {
      // Đã có quyền host, chỉ toggle viewing mode
      const newMode = currentViewMode === "traveller" ? "host" : "traveller";
      setCurrentViewMode(newMode);
      localStorage.setItem("viewMode", newMode);

      toast.success(
        newMode === "host"
          ? "Switched to Host mode"
          : "Switched to Travelling mode",
      );

      if (newMode === "host") {
        router.push("/hosting");
      } else {
        router.push("/");
      }
    }
  };

  const isHostMode = currentViewMode === "host";
  const canBeHost = profile?.is_host === true; // Strictly true
  const isNewUser = profile && profile.is_host !== true; // false or null = new user
  const isLoadingProfile = loading || (user && !profile); // Loading state

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
      // Force set về traveller mode TRƯỚC khi logout
      setCurrentViewMode("traveller");
      localStorage.removeItem("viewMode");

      // Clear tất cả profile cache
      if (user?.id) {
        localStorage.removeItem(`profile_${user.id}`);
      }

      await logoutUser();
      toast.success("Logged out successfully");
      setIsMenuOpen(false);

      // Redirect về trang chủ sau khi logout
      router.push("/");
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
          {isLoadingProfile ? (
            <>
              {/* Loading skeleton - giữ nguyên layout */}
              <div className="flex items-center gap-2 opacity-50">
                <LayoutDashboard size={30} />
                <span>Loading...</span>
              </div>
              <div className="flex items-center gap-2 opacity-50">
                <Home size={30} />
                <span>Loading...</span>
              </div>
            </>
          ) : isHostMode ? (
            <>
              {/* HOST MODE */}
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
            </>
          ) : (
            <>
              {/* TRAVELLER MODE */}
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
            </>
          )}
        </nav>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-4">
          {/* Become Host - Always visible */}
          <button
            onClick={handleToggleHostMode}
            disabled={switching}
            className="rounded-full bg-[#328E6E] px-5 py-3 text-white font-medium 
               hover:bg-[#67AE6E] transition disabled:opacity-50 hover:cursor-pointer"
          >
            {switching
              ? "Switching..."
              : isHostMode
                ? "Switch to Travelling"
                : canBeHost
                  ? "Switch to Hosting"
                  : "Become A Host"}
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
                      href="/profile"
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
