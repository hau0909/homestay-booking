"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Bell, Sparkles, Megaphone } from "lucide-react";
import { markOneNotificationAsRead } from "@/src/services/notifications/markNotificationAsRead";
import { supabase } from "@/src/lib/supabase";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: "NEW" | "CONFIRM" | "CANCEL";
  is_read: boolean;
};

const NotificationDropdown = ({
  notifications,
  markAsRead,
  onClose,
}: {
  notifications: Notification[];
  markAsRead: (id: string) => Promise<void>;
  onClose: () => void;
}) => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const noNotifications = notifications.length === 0;

  const renderIcon = (type: Notification["type"]) => {
    switch (type) {
      case "CONFIRM":
        return <CheckCircle className="text-green-500 w-5 h-5" />;
      case "CANCEL":
        return <XCircle className="text-red-500 w-5 h-5" />;
      case "NEW":
        return <Sparkles className="text-blue-500 w-5 h-5" />;
      default:
        return <Bell className="text-blue-500 w-5 h-5" />;
    }
  };

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      setLoadingUser(false);
    };

    getUser();

    // 🔹 theo dõi auth change
  }, []);

  const handleClick = async (n: Notification) => {
    if (!user) return;
    markAsRead(n.id);
    await markOneNotificationAsRead(n.id);
    onClose();
    router.push("/bookings");
  };

  if (loadingUser) {
    return (
      <div className="absolute right-0 mt-2 w-96 bg-white shadow-2xl rounded-2xl z-50 border border-gray-200 p-4 text-center text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white shadow-2xl rounded-2xl z-50 border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center bg-gray-50">
        <span className="font-semibold text-gray-800">Notifications</span>
        {user ? (
          <button
            disabled={noNotifications}
            onClick={() => notifications.forEach((n) => markAsRead(n.id))}
            className={`text-xs transition ${
              noNotifications
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-500 hover:underline cursor-pointer"
            }`}
          >
            Mark all read
          </button>
        ) : (
          <span className="text-xs text-gray-400">Login to manage</span>
        )}
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-md text-black flex flex-col justify-center items-center mt-10 mb-10">
            <div className="py-3">
              <Megaphone size={40} />
            </div>
            No Notifications
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleClick(n)}
              className={`flex gap-3 p-4 border-b hover:bg-gray-50 transition cursor-pointer ${
                !n.is_read ? "bg-blue-50" : ""
              }`}
            >
              <div className="mt-1">{renderIcon(n.type)}</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                <p className="text-sm text-gray-500">{n.message}</p>
              </div>
              {!n.is_read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
