import { supabase } from "@/src/lib/supabase";
import { Profile } from "@/src/types/profile";

import {
  validateEmail,
  validatePasswordStrength,
} from "@/src/utils/validation";

export const signUpWithVerifyEmail = async (
  email: string,
  password: string,
) => {
  // Check required fields first
  if (!email || email.trim() === "") {
    throw new Error("Email is required");
  }

  if (!password || password.trim() === "") {
    throw new Error("Password is required");
  }

  // Validate email format và check disposable email
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    throw new Error(emailValidation.error);
  }

  // Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.valid) {
    throw new Error(passwordValidation.error);
  }

  // Log password strength (optional)
  if (passwordValidation.strength) {
    console.log(`🔐 Password strength: ${passwordValidation.strength}`);
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${location.origin}/auth/verify`,
      data: {
        full_name: "", // Có thể để trống, user update sau
      },
    },
  });

  if (error) {
    if (error.message.includes("User already registered")) {
      throw new Error("❌ This email is already registered");
    }
    if (error.message.includes("Password do not match")) {
      throw new Error("Password do not match");
    }
    if (error.message.includes("Database error")) {
      throw new Error("❌ Database error. Please contact support.");
    }
    if (error.message.includes("is invalid")) {
      // Thay đổi message từ "is invalid" thành "does not exist"
      const emailMatch = error.message.match(/Email address "([^"]+)"/);
      if (emailMatch) {
        throw new Error(`Email address "${emailMatch[1]}" does not exist`);
      }
      throw new Error(error.message.replace("is invalid", "does not exist"));
    }
    throw new Error(`❌ ${error.message}`);
  }

  if (data.user) {
    const identities = data.user.identities;

    if (!identities || identities.length === 0) {
      throw new Error("already in use");
    }
  }

  // Check xem có cần verify email không
  if (data.user && !data.session) {
    console.log("✉️ Verification email sent to:", email);
  }

  return data;
};

export const loginUser = async (email: string, password: string) => {
  // Check required fields first
  if (!email || email.trim() === "") {
    throw new Error("Email is required");
  }

  if (!password || password.trim() === "") {
    throw new Error("Password is required");
  }

  // Validate email format
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    throw new Error(emailValidation.error);
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Xử lý các loại error cụ thể
    if (error.message.includes("Invalid login credentials")) {
      throw new Error("Invalid email or password");
    }
    if (error.message.includes("Email not confirmed")) {
      throw new Error("Please verify your email before logging in");
    }
    if (error.message.includes("User not found")) {
      throw new Error("Account does not exist");
    }
    if (error.message.includes("Email link is invalid or has expired")) {
      throw new Error("Please verify your email before logging in");
    }
    throw new Error(error.message);
  }

  // Check if user account is deleted
  if (data.user) {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profileData) {
      // Account không tồn tại trong profiles (có thể đã bị xóa)
      await supabase.auth.signOut();
      throw new Error("This account has been deleted");
    }
  }

  return data;
};

export const getUser = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error:", error);
    return null;
  }
};

export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${location.origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const signInWithFacebook = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "facebook",
    options: {
      redirectTo: `${location.origin}/auth/callback`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
