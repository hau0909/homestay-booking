"use client";

import { Profile } from "@/src/types/profile";
import { User, Mail, Phone, CreditCard, Calendar, Shield, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileViewProps {
  profile: Profile;
  onEdit: () => void;
}

export default function ProfileView({ profile, onEdit }: ProfileViewProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRoleBadge = (role: string) => {
    if (role === "ADMIN") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          <Shield className="w-4 h-4 mr-1" />
          Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
        <User className="w-4 h-4 mr-1" />
        User
      </span>
    );
  };

  return (

    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-black h-32"></div>

      <div className="px-6 pb-6">
        {/* Avatar & Name */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-8 mb-6">
          <div className="relative">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || "User avatar"}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center">
                <User className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* Thêm nhiều khoảng cách phía trên tên */}
          <div className="mt-24 sm:mt-0 sm:ml-6 flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-bold text-gray-900">
              {profile.full_name || "No Name"}
            </h1>
            <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              {getRoleBadge(profile.role)}
              {profile.is_host && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Host
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 sm:mt-0">
            <Button onClick={onEdit} className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700">{profile.bio}</p>
          </div>
        )}

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-900 font-medium">
                {profile.email || "Not provided"}
              </p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone Number</p>
              <p className="text-gray-900 font-medium">
                {profile.phone || "Not provided"}
              </p>
            </div>
          </div>

          {/* Identity Card */}
          {profile.identity_card && (
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Identity Card</p>
                <p className="text-gray-900 font-medium">
                  {profile.identity_card}
                </p>
              </div>
            </div>
          )}

          {/* Member Since */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Member Since</p>
              <p className="text-gray-900 font-medium">
                {formatDate(profile.created_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Last updated: {formatDate(profile.updated_at)}
          </p>
        </div>
      </div>
    </div>
  );
}
