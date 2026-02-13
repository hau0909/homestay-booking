"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Listing } from "@/src/types/listing";
import { getHostListings } from "@/src/services/listing/getHostListings";
import { updateListing } from "@/src/services/listing/updateListing";
import toast from "react-hot-toast";
import { getProfile } from "@/src/services/profile/profile.service";
import { useAuth } from "@/src/hooks/useAuth";

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const listingId = params?.id as string;
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    address_detail: "",
    description: "",
  });
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        if (user) {
          const profile = await getProfile(user.id);
          // Host: role USER và is_host true, hoặc ADMIN
          setIsHost((profile.role === "USER" && profile.is_host) || profile.role === "ADMIN");
        }
        const data = await getHostListings();
        const found = data.find((l) => l.id.toString() === listingId);
        setListing(found || null);
        if (found) {
          setForm({
            title: found.title || "",
            address_detail: found.address_detail || "",
            description: found.description || "",
          });
        }
      } catch {
        toast.error("Failed to load listing or profile");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [listingId, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing) return;
    try {
      await updateListing(listing.id, form);
      toast.success("Cập nhật thành công!");
      setListing({ ...listing, ...form });
    } catch (err: any) {
      toast.error(err.message || "Cập nhật thất bại!");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!listing) return <div className="p-8 text-red-500">Listing not found.</div>;

  return (
    <div className="max-w-xl mx-auto py-10 px-6">
      <h1 className="text-2xl font-bold mb-6">Edit Listing</h1>
      {isHost ? (
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Address</label>
            <input
              name="address_detail"
              value={form.address_detail}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              rows={4}
            />
          </div>
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              className="bg-[#328E6E] text-white px-6 py-2 rounded font-semibold"
            >
              Save Changes
            </button>
            <button
              type="button"
              className="border border-gray-300 px-6 py-2 rounded font-semibold"
              onClick={() => router.back()}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`px-6 py-2 rounded font-semibold text-white ${
                listing.status === "ACTIVE"
                  ? "bg-yellow-500 hover:bg-yellow-600"
                  : "bg-green-600 hover:bg-green-700"
              }`}
              onClick={async () => {
                const newStatus = listing.status === "ACTIVE" ? "HIDDEN" : "ACTIVE";
                try {
                  await updateListing(listing.id, { status: newStatus });
                  setListing({ ...listing, status: newStatus });
                  toast.success(`Listing is now ${newStatus === "ACTIVE" ? "visible" : "hidden"}`);
                } catch (err: any) {
                  toast.error("Failed to update listing status");
                }
              }}
            >
              {listing.status === "ACTIVE" ? "Hide Listing" : "Show Listing"}
            </button>
          </div>
        </form>
      ) : (
        <div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Title</label>
            <div className="w-full border px-3 py-2 rounded bg-gray-100">{form.title}</div>
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Address</label>
            <div className="w-full border px-3 py-2 rounded bg-gray-100">{form.address_detail}</div>
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Description</label>
            <div className="w-full border px-3 py-2 rounded bg-gray-100">{form.description}</div>
          </div>
        </div>
      )}
    </div>
  );
}
