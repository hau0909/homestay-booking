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
import { useRef } from "react";
import CreateVoucherModal from "@/src/components/hosting/CreateVoucherModal";
import EditVoucherModal from "@/src/components/hosting/EditVoucherModal";
import { Voucher } from "@/src/types/voucher";
import { getVouchersByListingId } from "@/src/services/voucher/getVouchersByListingId";

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
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

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
          // Lấy vouchers
          try {
            const vs = await getVouchersByListingId(found.id);
            setVouchers(vs);
          } catch {
            setVouchers([]);
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
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              className="border-slate-300"
              onClick={() => setVoucherModalOpen(true)}
            >
              Add Voucher
            </Button>
          </div>
          <CreateVoucherModal
            open={voucherModalOpen}
            onOpenChange={setVoucherModalOpen}
            listingId={listing.id}
            onCreated={async () => {
              const vs = await getVouchersByListingId(listing.id);
              setVouchers(vs);
            }}
          />
          {editingVoucher && (
            <EditVoucherModal
              open={true}
              onOpenChange={(open) => { if (!open) setEditingVoucher(null); }}
              voucher={editingVoucher}
              onUpdated={async () => {
                const vs = await getVouchersByListingId(listing.id);
                setVouchers(vs);
                setEditingVoucher(null);
              }}
            />
          )}
          {vouchers.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-slate-800 mb-3">Vouchers</h3>
              <div className="border rounded-lg overflow-hidden divide-y divide-slate-200">
                {vouchers.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between gap-4 px-4 py-3 bg-white"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 text-sm truncate">{v.code}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Discount: {v.discount_value}
                        {v.min_price != null ? ` · Min: ${v.min_price}` : ""}
                        {v.max_discount != null ? ` · Max off: ${v.max_discount}` : ""}
                        {v.usage_limit != null ? ` · Used: ${v.used_count ?? 0}/${v.usage_limit}` : ""}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                        v.is_active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {v.is_active ? "Active" : "Inactive"}
                    </span>
                    <button
                      type="button"
                      className="shrink-0 rounded-full border border-slate-200 bg-white px-6 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50"
                      onClick={() => setEditingVoucher(v)}
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
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
