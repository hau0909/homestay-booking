"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { checkProfileStatus } from "@/src/services/profile/checkProfileStatus";

export default function ProfileStatusProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      try {
        const isActive = await checkProfileStatus();

        if (!isActive) {
          // ❌ HOSTING
          if (pathname.startsWith("/hosting")) {
            toast.error(
              "Your account is restricted. You cannot access hosting features."
            );
            router.replace("/");
          }

          // ❌ BOOK
          if (pathname.startsWith("/book")) {
            toast.error("Your account cannot make bookings.");

            // quay lại trang trước (listing)
            router.back();
          }
        }
      } catch {
        toast.error("Please login to continue.");

        if (pathname.startsWith("/hosting")) {
          router.replace("/");
        }

        if (pathname.startsWith("/book")) {
          router.back();
        }
      } finally {
        setLoading(false);
      }
    }

    check();
  }, [pathname]);

  if (loading) return null;

  return <>{children}</>;
}