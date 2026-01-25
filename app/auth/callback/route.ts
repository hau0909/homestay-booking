import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabase";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL("/", requestUrl.origin));
}
