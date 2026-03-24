"use client";

import { Profile } from "@/src/types/profile";
import { BankAccount } from "@/src/types/bankAccount";
import { getUserBankAccount } from "@/src/services/banking/getUserBankAccount";
import { editUserBankAccount } from "@/src/services/banking/editUserBankAccount";
import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  Shield,
  Edit,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Link from "next/link";
import toast from "react-hot-toast";
import banksData from "@/src/data/banks.json";

interface ProfileViewProps {
  profile: Profile;
  onEdit: () => void;
}

export default function ProfileView({ profile, onEdit }: ProfileViewProps) {
  const [bankInfo, setBankInfo] = useState<BankAccount | null>(null);
  const [showBankInfo, setShowBankInfo] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [newBankInfo, setNewBankInfo] = useState({
    bank_name: "",
    account_name: "",
    account_number: "",
  });
  const [isSavingBank, setIsSavingBank] = useState(false);

  useEffect(() => {
    if (profile.is_host) {
      getUserBankAccount(profile.id)
        .then((data) => {
          setBankInfo(data);
          if (data) {
            setNewBankInfo({
              bank_name: data.bank_name || "",
              account_name: data.account_name || "",
              account_number: data.account_number || "",
            });
          }
        })
        .catch(() => setBankInfo(null));
    }
  }, [profile.id, profile.is_host]);

  const handleSaveBank = async () => {
    if (
      !newBankInfo.bank_name ||
      !newBankInfo.account_name ||
      !newBankInfo.account_number
    ) {
      toast.error("Please fill in all bank account fields.");
      return;
    }
    try {
      setIsSavingBank(true);
      const updatedBank = await editUserBankAccount(profile.id, newBankInfo);
      setBankInfo(updatedBank);
      setIsBankModalOpen(false);
      toast.success("Bank account saved successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to save bank account");
    } finally {
      setIsSavingBank(false);
    }
  };
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

          <div className="flex flex-col gap-4 sm:mt-0 ">
            <Button onClick={onEdit} className="flex items-center">
              <Edit className="w-4 h-4" />
              Edit Profile
            </Button>
            <Link
              href="/profile/change-password"
              className="flex items-center text-white bg-black px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors duration-300 cursor-pointer"
            >
              Change Password
            </Link>
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

          {/* Bank Info (Host only, lấy từ bảng bank_accounts) */}
          {profile.is_host && (
            <div className="col-span-1 md:col-span-2">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <Button
                  onClick={() => setShowBankInfo(!showBankInfo)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  {showBankInfo
                    ? "Hide Bank Account Info"
                    : "Show Bank Account Info"}
                </Button>
                <Button
                  onClick={() => {
                    if (!bankInfo) {
                      setNewBankInfo({
                        bank_name: "",
                        account_name: "",
                        account_number: "",
                      });
                    } else {
                      setNewBankInfo({
                        bank_name: bankInfo.bank_name || "",
                        account_name: bankInfo.account_name || "",
                        account_number: bankInfo.account_number || "",
                      });
                    }
                    setIsBankModalOpen(true);
                  }}
                  variant="default"
                  className="flex items-center gap-2 bg-black text-white hover:bg-gray-800"
                >
                  <Plus className="w-4 h-4" />
                  {bankInfo ? "Edit Bank Account" : "Add Bank Account"}
                </Button>
              </div>

              {showBankInfo && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <CreditCard className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Bank Name</p>
                      <p className="text-gray-900 font-medium">
                        {bankInfo?.bank_name || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <CreditCard className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Account Name</p>
                      <p className="text-gray-900 font-medium">
                        {bankInfo?.account_name || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <CreditCard className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Account Number</p>
                      <p className="text-gray-900 font-medium">
                        {bankInfo?.account_number || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
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

      {/* Bank Account Modal */}
      <Dialog open={isBankModalOpen} onOpenChange={setIsBankModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bankInfo ? "Edit Bank Account" : "Add Bank Account"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Bank Name</label>
              <select
                value={newBankInfo.bank_name}
                onChange={(e) =>
                  setNewBankInfo({ ...newBankInfo, bank_name: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled>Select a bank</option>
                {banksData.data.map((bank) => (
                  <option key={bank.code} value={bank.short_name}>
                    {bank.short_name} - {bank.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Account Name</label>
              <Input
                value={newBankInfo.account_name}
                onChange={(e) =>
                  setNewBankInfo({
                    ...newBankInfo,
                    account_name: e.target.value,
                  })
                }
                placeholder="e.g. NGUYEN VAN A"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Account Number</label>
              <Input
                value={newBankInfo.account_number}
                onChange={(e) =>
                  setNewBankInfo({
                    ...newBankInfo,
                    account_number: e.target.value,
                  })
                }
                placeholder="e.g. 1010101010"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBankModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveBank}
              disabled={isSavingBank}
              className="bg-black text-white hover:bg-gray-800"
            >
              {isSavingBank ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
