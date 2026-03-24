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
import { getHostStatus } from "@/src/services/host/getHostStatus.service";

export default function Header() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [isHost, setIsHost] = useState<boolean>(true); // null = not fetched yet
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [openNoti, setOpenNoti] = useState(false);
  const [redirectedOnLogin, setRedirectedOnLogin] = useState(false);
  const [mode, setMode] = useState<"host" | "travelling">(
    pathname.startsWith("/hosting") ? "host" : "travelling",
  );
  const menuRef = useRef<HTMLDivElement>(null);
  const { notifications, setNotifications } = useNotification(user?.id);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

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

  // ===== FETCH HOST STATUS =====
  useEffect(() => {
    if (!user) {
      queueMicrotask(() => {
        setIsHost(false);
        setMode("travelling");
        setRedirectedOnLogin(false);
      });
      return;
    }

    const fetchHostStatus = async () => {
      const hostStatus = await getHostStatus();
      setIsHost(hostStatus);
    };

    fetchHostStatus();
  }, [user?.id]);

  // ===== REDIRECT FOR HOSTS =====
  useEffect(() => {
    if (user && isHost && !redirectedOnLogin && pathname === "/") {
      router.replace("/hosting");
      setRedirectedOnLogin(true);
    }
  }, [user, isHost, redirectedOnLogin, pathname]);

  // ===== CLICK OUTSIDE MENU =====
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  // ===== LOGOUT =====
  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success("Logged out successfully");
      setIsHost(false);
      setMode("travelling");
      setIsMenuOpen(false);
      router.push("/");
    } catch {
      toast.error("Logout failed");
    }
  };

  // Sync mode khi pathname thay đổi
  useEffect(() => {
    setMode(pathname.startsWith("/hosting") ? "host" : "travelling");
  }, [pathname]);

  // ===== MODE SWITCH =====
  const handleSwitchMode = () => {
    if (!isHost) return; // cannot switch mode if user is not host
    if (mode === "host") {
      setMode("travelling");
      router.push("/");
    } else {
      setMode("host");
      router.push("/hosting");
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
  if (loading) return <div className="h-[72px] bg-white" />;

  return (
    <header className="w-full bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* NAV */}
        {mode === "host" && user ? (
          <nav className="hidden md:flex items-center gap-8 text-[#67AE6E] font-bold">
            <Link
              href="/hosting"
              className="flex items-center gap-2 hover:scale-110 transition"
            >
              <LayoutDashboard size={30} /> Dashboard
            </Link>
            <Link
              href="/hosting/listing"
              className="flex items-center gap-2 hover:scale-110 transition"
            >
              <Home size={30} /> Listing
            </Link>
            <Link
              href="/hosting/bookings"
              className="flex items-center gap-2 hover:scale-110 transition"
            >
              <ListOrdered size={30} /> Booking
            </Link>
            <Link
              href="/hosting/calendar"
              className="flex items-center gap-2 hover:scale-110 transition"
            >
              <CalendarCheck size={30} /> Calendar
            </Link>
            <Link
              href="/hosting/experience-booking-manager"
              className="flex items-center gap-2 hover:scale-110 transition"
            >
              <Binoculars size={30} /> Experiences order
            </Link>
            <Link
              href="/hosting/policies"
              className="flex items-center gap-2 hover:scale-110 transition"
            >
              <Shield size={30} strokeWidth={2} />
              Policies
            </Link>
          </nav>
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
          {user && isHost ? (
            <button
              onClick={() => {
                setMode(mode === "host" ? "travelling" : "host"); // update state ngay lập tức
                router.push(mode === "host" ? "/" : "/hosting"); // sau đó navigate
              }}
              className="rounded-full bg-[#328E6E] px-5 py-3 text-white hover:bg-[#67AE6E] transition cursor-pointer"
            >
              Switch to {mode === "host" ? "Travelling" : "Hosting"}
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
                      className="block px-4 py-2 text-[#328E6E] hover:bg-gray-200"
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/bookings"
                      className="block px-4 py-2 text-[#328E6E] hover:bg-gray-200"
                    >
                      My Bookings
                    </Link>
                    <Link
                      href="/host-request"
                      className="block px-4 py-2 text-[#328E6E] hover:bg-gray-200"
                    >
                      My Host Request
                    </Link>
                    <Link
                      href="/experience-bookings"
                      className="block px-4 py-2 text-[#328E6E] hover:bg-gray-200"
                    >
                      My Experience Bookings
                    </Link>

                    <div className="border-t my-2"></div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-200"
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
                      className="block w-full text-left px-4 py-2 text-[#328E6E] hover:bg-gray-200"
                    >
                      Sign Up
                    </button>
                    <button
                      onClick={() => {
                        setIsLoginModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-[#328E6E] hover:bg-gray-200"
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
