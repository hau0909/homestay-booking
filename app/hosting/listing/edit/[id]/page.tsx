"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Listing } from "@/src/types/listing";
import { getHostListings } from "@/src/services/listing/getHostListings";
import { updateListing } from "@/src/services/listing/updateListing";
import toast from "react-hot-toast";
import { getProfile } from "@/src/services/profile/profile.service";
import { useAuth } from "@/src/hooks/useAuth";

import { getListingImages } from "@/src/services/listing/getListingImages";
import { uploadListingImages } from "@/src/services/listing/uploadListingImages";
import { deleteListingImage } from "@/src/services/listing/deleteListingImage";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRef } from "react";

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

  // State cho quản lý ảnh
  const [images, setImages] = useState<any[]>([]);
  const [imgLoading, setImgLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
          // Lấy ảnh
          try {
            const imgs = await getListingImages(found.id);
            setImages(imgs);
          } catch {
            setImages([]);
          }
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
      router.push("/hosting/listing");
    } catch (err: any) {
      toast.error(err.message || "Cập nhật thất bại!");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!listing) return <div className="p-8 text-red-500">Listing not found.</div>;

  return (
    <div className="max-w-xl mx-auto py-10 px-6">
      <h1 className="text-2xl font-bold mb-6">Edit Listing</h1>
      {/* Quản lý ảnh listing */}
      {isHost && (
        <div className="mb-8">
          <h2 className="font-semibold mb-2">Listing Images</h2>
          <div className="flex flex-wrap gap-3">
            {images.map((img) => (
              <Dialog key={img.id}>
                <DialogTrigger asChild>
                  <img
                    src={img.url}
                    alt="listing-img"
                    className="w-28 h-20 object-cover rounded border cursor-pointer hover:ring-2 hover:ring-primary"
                    onClick={() => setSelectedImage(img)}
                  />
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>Ảnh listing</DialogTitle>
                  <div className="flex flex-col items-center gap-4">
                    <img src={img.url} alt="preview" className="w-60 h-44 object-cover rounded" />
                    <Button
                      variant="destructive"
                      disabled={imgLoading}
                      onClick={async () => {
                        setImgLoading(true);
                        try {
                          await deleteListingImage(img.id, img.url);
                          setImages((prev) => prev.filter((i) => i.id !== img.id));
                          toast.success("Đã xóa ảnh!");
                        } catch (err: any) {
                          toast.error(err.message || "Xóa ảnh thất bại!");
                        } finally {
                          setImgLoading(false);
                        }
                      }}
                    >
                      Xóa ảnh này
                    </Button>
                    <Button
                      variant="outline"
                      disabled={imgLoading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Thay thế ảnh
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setImgLoading(true);
                        try {
                          // Upload ảnh mới
                          await uploadListingImages(listing.id, [file]);
                          // Xóa ảnh cũ
                          await deleteListingImage(img.id, img.url);
                          // Reload ảnh
                          const imgs = await getListingImages(listing.id);
                          setImages(imgs);
                          toast.success("Đã thay thế ảnh!");
                        } catch (err: any) {
                          toast.error(err.message || "Thay thế ảnh thất bại!");
                        } finally {
                          setImgLoading(false);
                        }
                      }}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </div>
      )}
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
