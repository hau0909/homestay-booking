"use client";


import { getRules } from "@/src/services/listing/getRules";
import { getListingRules } from "@/src/services/listing/getListingRules";
import { saveListingRules } from "@/src/services/listing/saveListingRules";
import { Rule } from "@/src/types/rule";

import { useEffect, useState } from "react";
import { getHomeByListingId } from "@/src/services/home/getHomeByListingId";
import { updateHomeByListingId } from "@/src/services/home/updateHomeByListingId";
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
import { Button } from "../../../../../components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "../../../../../components/ui/dialog";
import { useRef } from "react";
import CreateVoucherModal from "@/src/components/hosting/CreateVoucherModal";
import EditVoucherModal from "@/src/components/hosting/EditVoucherModal";
import { Voucher } from "@/src/types/voucher";
import { getVouchersByListingId } from "@/src/services/voucher/getVouchersByListingId";
import { getAmenities } from "@/src/services/listing/getAmenities";
import { getListingAmenities } from "@/src/services/listing/getListingAmenities";
import { saveAmenities } from "@/src/services/listing/saveAmenities";
import { Amenity } from "@/src/types/amenity";

export default function EditListingPage() {
  // Rules state
  const [rules, setRules] = useState<Rule[]>([]);
  const [selectedRules, setSelectedRules] = useState<number[]>([]);
  const [rulesLoading, setRulesLoading] = useState(false);
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
  const [home, setHome] = useState<any>(null);
  const [homePrice, setHomePrice] = useState({ price_weekday: "", price_weekend: "" });

  // State cho quản lý ảnh
  const [images, setImages] = useState<any[]>([]);
  const [imgLoading, setImgLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

  // Amenities state
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
  const [amenitiesLoading, setAmenitiesLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        if (user) {
          const profile = await getProfile(user.id);
          setIsHost((profile.role === "USER" && profile.is_host) || profile.role === "ADMIN");
        }
        const data = await getHostListings();
        const found = data.find((l) => l.id.toString() === listingId);
        setListing(found || null);
        if (found) {
          // Lấy giá từ bảng homes
          try {
            const homeData = await getHomeByListingId(found.id.toString());
            setHome(homeData);
            setHomePrice({
              price_weekday: homeData?.price_weekday?.toString() || "",
              price_weekend: homeData?.price_weekend?.toString() || "",
            });
          } catch {}
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
          // Lấy amenities
          setAmenitiesLoading(true);
          setRulesLoading(true);
          try {
            const [allAmenities, listingAmenityIds, allRules, listingRules] = await Promise.all([
              getAmenities(),
              getListingAmenities(found.id),
              getRules(),
              getListingRules(found.id),
            ]);
            setAmenities(allAmenities);
            setSelectedAmenities(listingAmenityIds);
            setRules(allRules);
            setSelectedRules(listingRules.map((r: Rule) => r.id));
            console.log("allRules", allRules, "listingRules", listingRules);
          } catch {
            setAmenities([]);
            setSelectedAmenities([]);
            setRules([]);
            setSelectedRules([]);
          } finally {
            setAmenitiesLoading(false);
            setRulesLoading(false);
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
      // Update home price fields
      if (home) {
        await updateHomeByListingId(listing.id, {
          price_weekday: Number(homePrice.price_weekday),
          price_weekend: Number(homePrice.price_weekend),
        });
      }
      // Update amenities
      await saveAmenities(listing.id, selectedAmenities);
      // Update rules
      await saveListingRules(listing.id, selectedRules);
      toast.success("Cập nhật thành công!");
      router.push("/hosting/listing");
    } catch (err: any) {
      toast.error(err.message || "Cập nhật thất bại!");
    }
  };
  const handleHomePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHomePrice({ ...homePrice, [e.target.name]: e.target.value });
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!listing) return <div className="p-8 text-red-500">Listing not found.</div>;

  return (
    <div className="max-w-2xl mx-auto py-10 px-6 bg-white rounded-2xl shadow-lg border border-slate-100">
      <h1 className="text-3xl font-bold mb-8 text-[#328E6E] drop-shadow">Edit Listing</h1>
      {/* Quản lý ảnh listing */}
      {isHost && (
        <div className="mb-8 p-4 bg-slate-50 rounded-xl shadow border border-slate-100">
          <h2 className="font-semibold mb-3 text-lg text-[#328E6E]">Listing Images</h2>
          <div className="flex flex-wrap gap-4">
            {images.map((img) => (
              <Dialog key={img.id}>
                <DialogTrigger asChild>
                  <img
                    src={img.url}
                    alt="listing-img"
                    className="w-32 h-24 object-cover rounded-lg border border-slate-200 cursor-pointer transition hover:ring-2 hover:ring-[#328E6E] hover:scale-105"
                    onClick={() => setSelectedImage(img)}
                  />
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>Ảnh listing</DialogTitle>
                  <div className="flex flex-col items-center gap-4">
                    <img src={img.url} alt="preview" className="w-72 h-52 object-cover rounded-xl shadow" />
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
        <form onSubmit={handleSave} className="space-y-6 bg-white p-6 rounded-xl shadow border border-slate-100">
          <div>
            <label className="block font-semibold mb-1 text-slate-700">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border border-slate-300 px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#328E6E] outline-none transition"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-slate-700">Address</label>
            <input
              name="address_detail"
              value={form.address_detail}
              onChange={handleChange}
              className="w-full border border-slate-300 px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#328E6E] outline-none transition"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-slate-700">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border border-slate-300 px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#328E6E] outline-none transition"
              rows={4}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-slate-700">Weekday Price</label>
            <input
              name="price_weekday"
              type="number"
              value={homePrice.price_weekday}
              onChange={handleHomePriceChange}
              className="w-full border border-slate-300 px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#328E6E] outline-none transition"
              min={0}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-slate-700">Weekend Price</label>
            <input
              name="price_weekend"
              type="number"
              value={homePrice.price_weekend}
              onChange={handleHomePriceChange}
              className="w-full border border-slate-300 px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#328E6E] outline-none transition"
              min={0}
            />
          </div>
          {/* Amenities editing section */}
          <div>
            <label className="block font-semibold mb-1 text-slate-700">Amenities</label>
            {amenitiesLoading ? (
              <div className="text-gray-500">Loading amenities...</div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {amenities.map((a) => (
                  <label key={a.id} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition shadow-sm ${selectedAmenities.includes(a.id) ? "bg-[#e6f7f1] border-[#328E6E]" : "border-slate-200 hover:border-[#328E6E] hover:bg-slate-50"}`}>
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(a.id)}
                      onChange={() => {
                        setSelectedAmenities((prev) =>
                          prev.includes(a.id)
                            ? prev.filter((id) => id !== a.id)
                            : [...prev, a.id]
                        );
                      }}
                      className="accent-[#328E6E] w-4 h-4"
                    />
                    {a.icon_url ? (
                      <img src={a.icon_url} alt={a.name} className="w-6 h-6 rounded" />
                    ) : (
                      <span className="w-6 h-6 bg-gray-300 rounded inline-block" />
                    )}
                    <span className="text-sm font-medium text-slate-700">{a.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          {/* Rules editing section */}
          <div>
            <label className="block font-semibold mb-1 text-slate-700">Rules</label>
            {rulesLoading ? (
              <div className="text-gray-500">Loading rules...</div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {rules.map((r) => (
                  <label key={r.id} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition shadow-sm ${selectedRules.includes(r.id) ? "bg-[#e6f7f1] border-[#328E6E]" : "border-slate-200 hover:border-[#328E6E] hover:bg-slate-50"}`}>
                    <input
                      type="checkbox"
                      checked={selectedRules.includes(r.id)}
                      onChange={() => {
                        setSelectedRules((prev) =>
                          prev.includes(r.id)
                            ? prev.filter((id) => id !== r.id)
                            : [...prev, r.id]
                        );
                      }}
                      className="accent-[#328E6E] w-4 h-4"
                    />
                    <span className="text-sm font-medium text-slate-700">{r.content}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              className="border-slate-300 rounded-lg shadow-sm hover:bg-[#e6f7f1] hover:border-[#328E6E] transition"
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
              <div className="border rounded-xl overflow-hidden divide-y divide-slate-100 bg-slate-50 shadow-sm">
                {vouchers.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between gap-4 px-4 py-3 bg-white hover:bg-[#e6f7f1] transition"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-[#328E6E] text-base truncate">{v.code}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Discount: {v.discount_value}
                        {v.min_price != null ? ` · Min: ${v.min_price}` : ""}
                        {v.max_discount != null ? ` · Max off: ${v.max_discount}` : ""}
                        {v.usage_limit != null ? ` · Used: ${v.used_count ?? 0}/${v.usage_limit}` : ""}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${
                        v.is_active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {v.is_active ? "Active" : "Inactive"}
                    </span>
                    <button
                      type="button"
                      className="shrink-0 rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-[#e6f7f1] hover:border-[#328E6E]"
                      onClick={() => setEditingVoucher(v)}
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              className="bg-[#328E6E] text-white px-8 py-2 rounded-lg font-semibold shadow hover:bg-[#246b52] transition"
            >
              Save Changes
            </button>
            <button
              type="button"
              className="border border-gray-300 px-8 py-2 rounded-lg font-semibold bg-white shadow hover:bg-slate-100 transition"
              onClick={() => router.back()}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`px-8 py-2 rounded-lg font-semibold text-white shadow transition ${
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
