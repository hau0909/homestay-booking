"use client";

import {
  Menu,
  User,
  HouseHeart,
  Binoculars,
  LayoutDashboard,
  Home,
  ListOrdered,
  CalendarCheck,
  Heart,
  ListCheck,
  Shield,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import SignUpModal from "../auth/SignUpModal";
import LoginModal from "../auth/LoginModal";
import { useAuth } from "@/src/hooks/useAuth";
import { logoutUser } from "@/src/services/auth/auth.service";
import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import NotificationBell from "../notifications/NotificationBell";
import NotificationDropdown from "../notifications/NotificationDropdown";
import useNotification from "@/src/hooks/useNotification";
import { markOneNotificationAsRead } from "@/src/services/notifications/markNotificationAsRead";

export default function Header() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mode, setMode] = useState<"host" | "travelling">(() => {
    return user ? "host" : "travelling";
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [openNoti, setOpenNoti] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const { notifications, setNotifications } = useNotification(user?.id);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const isHostMode = mode === "host";

  // ===== MARK AS READ =====
  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );

    try {
      await markOneNotificationAsRead(id);
    } catch (e) {
      console.error(e);
    }
  };

  // State lưu thông tin đã redirect login chưa
  const [redirectedOnLogin, setRedirectedOnLogin] = useState(false);

  useEffect(() => {
    const updateModeAndRedirect = async () => {
      if (user && !redirectedOnLogin) {
        // dùng setTimeout 0 để defer state update
        setTimeout(() => {
          setMode("host"); // login → host mode
          if (pathname === "/") {
            router.replace("/hosting"); // redirect nếu ở "/"
          }
          setRedirectedOnLogin(true);
        }, 0);
      }

      if (!user) {
        setTimeout(() => {
          setMode("travelling"); // logout → travelling mode
          setRedirectedOnLogin(false); // reset flag
        }, 0);
      }
    };

    updateModeAndRedirect();
  }, [user?.id]);

  // ===== CLICK OUTSIDE MENU =====
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

  // ===== LOGOUT =====
  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success("Logged out successfully");
      setMode("travelling"); // reset về bình thường
      setIsMenuOpen(false);
      router.push("/");
    } catch {
      toast.error("Logout failed");
    }
  };

  // ===== MODE SWITCH =====
  const handleSwitchMode = () => {
    if (mode === "host") {
      setMode("travelling");
      router.push("/"); // đi Travelling
    } else {
      setMode("host");
      router.push("/hosting"); // đi Host
    }
  };

  const handleBecomeHost = () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    router.push("/become-host/sendRequestHost");
  };

  const getInitial = (email: string) => email.charAt(0).toUpperCase();

  // ===== PREVENT FLICKER =====
  if (loading) {
    return <div className="h-[72px] bg-white" />;
  }

  return (
    <header className="w-full bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* NAV */}
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
              <Link
                href="/hosting/experience-booking-manager"
                className="flex items-center gap-2 transition-transform duration-300 hover:scale-110"
              >
                <Binoculars size={30} />
                Experiences order
              </Link>
              <Link
                href="/hosting/policies"
                className="flex items-center gap-2 transition-transform duration-300 hover:scale-110"
              >
                <Shield size={30} strokeWidth={2} />
                Policies Setup
              </Link>
            </nav>
          </>
        ) : (
          <nav className="hidden md:flex items-center gap-8 text-[#67AE6E] font-bold">
            <Link
              href="/"
              className="flex items-center gap-2 hover:scale-110 transition"
            >
              <HouseHeart size={30} /> Homestay
            </Link>
            <Link
              href="/experience-listings"
              className="flex items-center gap-2 hover:scale-110 transition"
            >
              <Binoculars size={30} /> Experiences
            </Link>
            <Link
              href="/wishlist"
              className="flex items-center gap-2 hover:scale-110 transition"
            >
              <Heart size={30} /> Wishlist
            </Link>
          </nav>
        )}

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          {/* NOTIFICATION */}
          <div className="relative">
            <NotificationBell
              count={unreadCount}
              onClick={() => setOpenNoti(!openNoti)}
            />

            {openNoti && (
              <NotificationDropdown
                notifications={notifications}
                markAsRead={markAsRead}
                onClose={() => setOpenNoti(false)}
              />
            )}
          </div>

          {/* SWITCH / HOST */}
          {user ? (
            <button
              onClick={handleSwitchMode}
              className="rounded-full bg-[#328E6E] px-5 py-3 text-white hover:bg-[#67AE6E] transition cursor-pointer"
            >
              {isHostMode ? "Switch to Travelling" : "Switch to Hosting"}
            </button>
          ) : (
            <button
              onClick={handleBecomeHost}
              className="rounded-full bg-[#328E6E] px-5 py-3 text-white hover:bg-[#67AE6E] transition cursor-pointer"
            >
              Become a Host
            </button>
          )}

          {/* USER MENU */}
          <div className="relative" ref={menuRef}>
            <div
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 rounded-full bg-[#328E6E] p-2 cursor-pointer hover:bg-[#67AE6E]"
            >
              <Menu size={18} />

              {user ? (
                user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-7 w-7 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm">
                    {getInitial(user.email ?? "U")}
                  </div>
                )
              ) : (
                <div className="h-7 w-7 bg-[#67AE6E] rounded-full flex items-center justify-center">
                  <User size={18} className="text-white" />
                </div>
              )}
            </div>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50">
                {user ? (
                  <>
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-semibold truncate">
                        {user.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.user_metadata?.full_name || "User"}
                      </p>
                    </div>

                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-[#328E6E] hover:text-[#67AE6E] hover:bg-gray-200 transition-colors"
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/bookings"
                      className="block px-4 py-2 text-[#328E6E] hover:text-[#67AE6E] hover:bg-gray-200 transition-colors"
                    >
                      My Bookings
                    </Link>
                    <Link
                      href="/host-request"
                      className="block px-4 py-2 text-[#328E6E] hover:text-[#67AE6E] hover:bg-gray-200 transition-colors"
                    >
                      My Host Request
                    </Link>
                    <Link
                      href="/experience-bookings"
                      className="block px-4 py-2 text-[#328E6E] hover:text-[#67AE6E] hover:bg-gray-200 transition-colors"
                    >
                      My Experience Bookings
                    </Link>

                    <div className="border-t my-2"></div>

                    <button
                      onClick={handleLogout}
                      className="block w-full hover:cursor-pointer text-left px-4 py-2 text-red-600 hover:bg-gray-200 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <SignUpModal
        isOpen={isSignUpModalOpen}
        onClose={() => setIsSignUpModalOpen(false)}
      />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </header>
  );
}
