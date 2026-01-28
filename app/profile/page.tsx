"use client";

// Profile page - View and edit user profile
import { useEffect, useState } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { getProfile } from "@/src/services/profile/profile.service";
import { Profile } from "@/src/types/profile";
import ProfileView from "@/src/components/profile/ProfileView";
import ProfileEdit from "@/src/components/profile/ProfileEdit";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Redirect to homepage if not authenticated
    if (!authLoading && !user) {
      toast.error("Please login to view your profile");
      router.replace("/");
      return;
    }

    // Load profile data
    if (user) {
      loadProfile();
    }
  }, [user, authLoading, router]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await getProfile(user!.id);
      setProfile(profileData);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
    setIsEditing(false);
    toast.success("Profile updated successfully!");
  };

  // Show loading while checking auth or loading profile
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated (prevent rendering)
  if (!user) {
    return null;
  }

  // Show error if profile not found
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {isEditing ? (
          <ProfileEdit
            profile={profile}
            onSave={handleProfileUpdate}
            onCancel={handleEditToggle}
          />
        ) : (
          <ProfileView profile={profile} onEdit={handleEditToggle} />
        )}
      </div>
    </div>
  );
}
