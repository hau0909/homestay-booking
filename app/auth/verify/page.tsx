"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import Link from "next/link";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Check for error in URL hash first
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1),
        );
        const errorCode = hashParams.get("error_code");
        const errorDescription = hashParams.get("error_description");

        if (errorCode === "otp_expired") {
          setStatus("error");
          setMessage("Verification link has expired. Please sign up again.");
          return;
        }

        if (errorCode) {
          setStatus("error");
          setMessage(errorDescription || "Verification failed");
          return;
        }

        // Lấy token từ URL query params
        const token_hash = searchParams.get("token_hash");
        const type = searchParams.get("type");

        // Check for success token in hash
        const accessToken = hashParams.get("access_token");

        if (accessToken) {
          // User đã được verify thành công
          setStatus("success");
          setMessage("Email verified successfully!");
          setTimeout(() => {
            router.push("/");
          }, 2000);
          return;
        }

        if (!token_hash) {
          setStatus("error");
          setMessage("Invalid verification link");
          return;
        }

        // Verify email với Supabase (legacy flow)
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type:
            (type as "email" | "signup" | "magiclink" | "recovery") || "email",
        });

        if (error) {
          console.error("Verification error:", error);
          setStatus("error");
          setMessage("Verification failed. Link may have expired.");
        } else {
          setStatus("success");
          setMessage("Email verified successfully!");
          setTimeout(() => {
            router.push("/");
          }, 2000);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        setStatus("error");
        setMessage("An unexpected error occurred");
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6 bg-white p-8 rounded-2xl shadow-lg max-w-md w-full mx-4">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#328E6E] mx-auto"></div>
            <h1 className="text-2xl font-semibold text-[#328E6E]">{message}</h1>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-6xl">🎉</div>
            <h1 className="text-2xl font-semibold text-[#328E6E]">{message}</h1>
            <p className="text-gray-600">Redirecting to home page...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-6xl">❌</div>
            <h1 className="text-2xl font-semibold text-red-600">{message}</h1>
            <Link
              href="/"
              className="inline-block rounded-lg bg-[#328E6E] px-6 py-3 text-white hover:bg-[#67AE6E] transition-colors"
            >
              Back to Home
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
