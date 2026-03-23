"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { getAllNotifications } from "../services/notifications/getNotifications";

const useNotification = (userId?: string) => {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) {
      // 🔹 reset notifications khi logout
      setNotifications([]);
      return;
    }

    let isMounted = true;

    const init = async () => {
      const data = await getAllNotifications(userId);
      if (isMounted) {
        setNotifications(data);
      }
    };

    init();

    const channel = supabase
      .channel(`noti-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => {
            const exists = prev.some((n) => n.id === payload.new.id);
            if (exists) return prev;
            return [payload.new, ...prev];
          });
        },
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { notifications, setNotifications };
};

export default useNotification;
