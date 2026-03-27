"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Experience } from "@/src/types/experience";
import { ExperienceActivity } from "@/src/types/experienceActivity";
import { ExperienceSlot } from "@/src/types/experienceSlot";
import { District, Province, Ward } from "@/src/types/location";
import { ListingImage } from "@/src/types/listingImages";

import { getExperience } from "@/src/services/experience/getExperience";
import { getExperienceActivities } from "@/src/services/experience/getExperienceActivities";
import { getAllExperienceSlots } from "@/src/services/experience/getAllExperienceSlots";

import { updateExperience } from "@/src/services/experience/updateExperience";
import { updateExperienceSlot } from "@/src/services/experience/updateExperienceSlot";
import { toggleExperienceSlotStatus } from "@/src/services/experience/toggleExperienceSlotStatus";

import { getListingForEdit } from "@/src/services/listing/getListingForEdit";
import { getProvinces } from "@/src/services/listing/getProvince";
import { getDistrictsByProvince } from "@/src/services/listing/getDistrict";
import { getWardsByDistrict } from "@/src/services/listing/getWard";

import { getListingImagesForEdit } from "@/src/services/listing/getListingImagesForEdit";
import { updateListingImageForEdit } from "@/src/services/listing/updateListingImageForEdit";
import { uploadListingImageForEdit } from "@/src/services/listing/uploadListingImageForEdit";
import { saveLocation } from "@/src/services/listing/saveLocation";
import { updateListing } from "@/src/services/listing/updateListing";

import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { ListingStatus } from "@/src/types/enums";
import { getListingBannedDetail } from "@/src/services/listing/getListingBannedDetail";
import AddSlotModal from "@/src/components/listing/AddSlotModal";
import AddActivityModal from "@/src/components/listing/AddActivityModal";
import EditActivityModal from "@/src/components/listing/EditActivityModal";
import CreateVoucherModal from "@/src/components/hosting/CreateVoucherModal";
import EditVoucherModal from "@/src/components/hosting/EditVoucherModal";
import { Voucher } from "@/src/types/voucher";
import { getVouchersByListingId } from "@/src/services/voucher/getVouchersByListingId";

export default function EditExperiencePage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const [experience, setExperience] = useState<Experience | null>(null);
  const [activities, setActivities] = useState<ExperienceActivity[]>([]);
  const [slots, setSlots] = useState<ExperienceSlot[]>([]);
  const [images, setImages] = useState<ListingImage[]>([]);

  const [loading, setLoading] = useState(true);
  const [listingStatus, setListingStatus] = useState<ListingStatus>("DRAFT");

  const [editingSlot, setEditingSlot] = useState<ExperienceSlot | null>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [maxAttendees, setMaxAttendees] = useState(1);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [provinceCode, setProvinceCode] = useState("");
  const [districtCode, setDistrictCode] = useState("");
  const [wardCode, setWardCode] = useState("");
  const [address, setAddress] = useState("");

  const [selectedImage, setSelectedImage] = useState<ListingImage | null>(null);
  const [bannedReason, setBannedReason] = useState<string>("");
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] =
    useState<ExperienceActivity | null>(null);

  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  // ---------- Helper functions ----------
  const isEditable =
    listingStatus === "ACTIVE" ||
    listingStatus === "HIDDEN" ||
    listingStatus === "DRAFT" ||
    listingStatus === "PENDING";
  const canToggle = listingStatus === "ACTIVE" || listingStatus === "HIDDEN";

  const hasRequiredFields = () => {
    if (!experience) {
      return false;
    }

    return (
      experience.title?.trim() !== "" &&
      experience.description?.trim() !== "" &&
      experience.price_per_person >= 0 &&
      address.trim() !== "" &&
      provinceCode &&
      districtCode &&
      wardCode &&
      images.length > 0 &&
      slots.length > 0 &&
      activities.length > 0
    );
  };

  const canGoPending = () => {
    return listingStatus === "DRAFT" && hasRequiredFields();
  };

  // ---------- Load data ----------
  useEffect(() => {
    if (!id) return;

    loadExperience();
    getProvinces().then(setProvinces);
    loadLocation(String(id));
    loadImages();
  }, [id]);

  useEffect(() => {
    if (!provinceCode) return;
    getDistrictsByProvince(provinceCode).then(setDistricts);
  }, [provinceCode]);

  useEffect(() => {
    if (!districtCode) return;
    getWardsByDistrict(districtCode).then(setWards);
  }, [districtCode]);
  useEffect(() => {
    if (listingStatus === "BANNED") {
      getListingBannedDetail(id).then((detail) => {
        setBannedReason(detail?.description || "No reason provided");
      });
    }
  }, [listingStatus, id]);
  const loadExperience = async () => {
    setLoading(true);

    const exp = await getExperience(id);
    if (!exp) {
      setLoading(false);
      return;
    }

    const acts = await getExperienceActivities(exp.id);
    const sls = await getAllExperienceSlots(exp.id);

    setExperience(exp);
    setActivities(acts);
    setSlots(sls);

    try {
      const vs = await getVouchersByListingId(exp.id);
      setVouchers(vs);
    } catch {
      setVouchers([]);
    }

    setLoading(false);
  };

  const loadLocation = async (listingId: string) => {
    const listing = await getListingForEdit(listingId);
    if (!listing) {
      toast.error("Listing not found");
      return;
    }

    setListingStatus(listing.status);
    setProvinceCode(listing.province_code || "");
    setDistrictCode(listing.district_code || "");
    setWardCode(listing.ward_code || "");
    setAddress(listing.address_detail || "");
  };

  const loadImages = async () => {
    const data = await getListingImagesForEdit(Number(id));
    setImages(data); // 🔥 bỏ filter
  };

  const handleReplaceImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    imageId: number,
  ) => {
    if (!isEditable) return;
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadListingImageForEdit(file);
      await updateListingImageForEdit(imageId, url);
      await loadImages();
      setSelectedImage(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateExperience = async () => {
    if (!isEditable || !experience) return;

    console.log({
      title: experience.title,
      desc: experience.description,
      price: experience.price_per_person,
      address,
      provinceCode,
      districtCode,
      wardCode,
      images: images.length,
      slots: slots.length,
      activities: activities.length,
    });

    // Chỉ validate phần Experience Info
    if (
      !experience.title?.trim() ||
      !experience.description?.trim() ||
      experience.price_per_person < 0 ||
      !address.trim() ||
      !provinceCode ||
      !districtCode ||
      !wardCode
    ) {
      toast.error("Please complete all Experience Info fields to save");
      return;
    }

    try {
      await updateExperience(
        experience.id,
        experience.title,
        experience.description,
        experience.price_per_person,
      );

      await saveLocation(id, {
        province_code: provinceCode,
        district_code: districtCode,
        ward_code: wardCode,
        address_detail: address,
      });

      // 👉 xác định status mới
      let newStatus = listingStatus;

      if (listingStatus === "DRAFT" && canGoPending()) {
        newStatus = "PENDING";
      }

      await updateListing(id, {
        title: experience.title,
        description: experience.description,
        province_code: provinceCode,
        district_code: districtCode,
        ward_code: wardCode,
        address_detail: address,
        status: newStatus, // 🔥 thêm dòng này
      });

      // 👉 update lại UI
      setListingStatus(newStatus);

      toast.success("Experience updated");
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    }
  };

  const toggleSlot = async (slotId: number, status: boolean) => {
    if (!isEditable) return;
    const success = await toggleExperienceSlotStatus(slotId, status);
    if (!success) {
      toast.error("Update failed");
      return;
    }
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, is_active: !status } : s)),
    );
  };
  const toggleListingStatus = async () => {
    if (!isEditable) return;

    try {
      const newStatus = listingStatus === "ACTIVE" ? "HIDDEN" : "ACTIVE";

      await updateListing(id, { status: newStatus });

      setListingStatus(newStatus);

      toast.success(
        newStatus === "ACTIVE"
          ? "Listing is now visible"
          : "Listing is now hidden",
      );
    } catch (err) {
      console.error(err);
      toast.error("Update status failed");
    }
  };

  const updateSlot = async () => {
    if (!editingSlot || !isEditable) return;
    if (startTime >= endTime) {
      toast.error("Start time must be before end time");
      return;
    }
    const date = editingSlot.start_time.slice(0, 10);
    const newStart = `${date}T${startTime}:00`;
    const newEnd = `${date}T${endTime}:00`;

    const success = await updateExperienceSlot(
      editingSlot.id,
      newStart,
      newEnd,
      maxAttendees,
    );
    if (!success) {
      toast.error("Update slot failed");
      return;
    }

    setSlots((prev) =>
      prev.map((s) =>
        s.id === editingSlot.id
          ? {
              ...s,
              start_time: newStart,
              end_time: newEnd,
              max_attendees: maxAttendees,
            }
          : s,
      ),
    );
    toast.success("Slot updated");
    setEditingSlot(null);
  };

  if (loading) return <div className="p-10">Loading...</div>;
  if (!experience) return <div className="p-10">Experience not found</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-gray-50/50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => router.push("/hosting/listing?tab=EXPERIENCE")}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-3"
          >
            <ArrowLeft size={16} />
            Back to listings
          </button>
          
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Edit Experience</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
              listingStatus === "ACTIVE" ? "bg-green-100 text-green-700" :
              listingStatus === "PENDING" ? "bg-yellow-100 text-yellow-700" :
              listingStatus === "HIDDEN" ? "bg-gray-200 text-gray-700" :
              listingStatus === "BANNED" ? "bg-red-100 text-red-700" :
              "bg-blue-100 text-blue-700"
            }`}>
              {listingStatus}
            </span>
          </div>
          <p className="text-gray-500 mt-2 text-sm">
            Manage your experience details, photos, and availability slots.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canToggle && (
            <button
              onClick={toggleListingStatus}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm ${
                listingStatus === "ACTIVE"
                  ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {listingStatus === "ACTIVE" ? "Hide Listing" : "Publish Listing"}
            </button>
          )}
          {isEditable && (
            <button
              onClick={() => setVoucherModalOpen(true)}
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm"
            >
              Add Voucher
            </button>
          )}
        </div>
      </div>

      {/* BANNERS */}
      {listingStatus === "BANNED" && bannedReason && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl shadow-sm flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <p className="font-medium">This experience is banned: <span className="font-normal">{bannedReason}</span></p>
        </div>
      )}

      {listingStatus === "DRAFT" && !canGoPending() && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-5 py-4 rounded-xl shadow-sm flex items-center gap-3">
          <span className="text-xl">ℹ️</span>
          <p className="font-medium">Complete all required fields below to submit this experience for approval.</p>
        </div>
      )}

      {/* IMAGES GALLERY (No Edit) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Gallery</h2>
        <p className="text-sm text-gray-500 mb-5">Experience photos added from activities. These cannot be modified here.</p>
        
        {images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((img) => (
              <div key={img.id} className="relative aspect-square group overflow-hidden rounded-xl border border-gray-200">
                <img
                  src={img.url}
                  alt="Experience gallery"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400">
            No photos yet. Add activities to display photos.
          </div>
        )}
      </div>

      {/* EXPERIENCE INFO */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-5">
           <div>
             <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
             <p className="text-sm text-gray-500">Title, description, and location of your experience.</p>
           </div>
           <button
             onClick={handleUpdateExperience}
             className={`px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm ${
               isEditable 
                 ? "bg-gray-900 text-white hover:bg-black" 
                 : "bg-gray-100 text-gray-400 cursor-not-allowed"
             }`}
           >
             Save Changes
           </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* LEFT INFO */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Experience Title</label>
              <input
                value={experience.title}
                onChange={(e) => isEditable && setExperience({ ...experience, title: e.target.value })}
                className={`w-full border-gray-300 rounded-xl px-4 py-2.5 border focus:ring-2 focus:ring-black focus:border-black transition-all ${
                  !isEditable ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "bg-white"
                }`}
                placeholder="Enter an exciting title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea
                value={experience.description || ""}
                onChange={(e) => isEditable && setExperience({ ...experience, description: e.target.value })}
                rows={4}
                className={`w-full border-gray-300 rounded-xl px-4 py-3 border focus:ring-2 focus:ring-black focus:border-black transition-all resize-none ${
                  !isEditable ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "bg-white"
                }`}
                placeholder="Describe what guests will do..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Price per person</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                <input
                  type="number"
                  value={experience.price_per_person}
                  onChange={(e) => isEditable && setExperience({ ...experience, price_per_person: Number(e.target.value) })}
                  className={`w-full border-gray-300 rounded-xl pl-8 pr-4 py-2.5 border focus:ring-2 focus:ring-black focus:border-black transition-all ${
                    !isEditable ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "bg-white"
                  }`}
                  min={0}
                />
              </div>
            </div>
          </div>

          {/* RIGHT LOCATION */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Province</label>
              <select
                value={provinceCode}
                onChange={(e) => isEditable && setProvinceCode(e.target.value)}
                className={`w-full border-gray-300 rounded-xl px-4 py-2.5 border focus:ring-2 focus:ring-black focus:border-black transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%207l5%205%205-5%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_12px_center] bg-no-repeat ${
                  !isEditable ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "bg-white"
                }`}
              >
                <option value="">Select province...</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.code}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">District</label>
                <select
                  value={districtCode}
                  onChange={(e) => isEditable && setDistrictCode(e.target.value)}
                  disabled={!provinceCode || !isEditable}
                  className={`w-full border-gray-300 rounded-xl px-4 py-2.5 border focus:ring-2 focus:ring-black focus:border-black transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%207l5%205%205-5%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_12px_center] bg-no-repeat ${
                    !provinceCode || !isEditable ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "bg-white"
                  }`}
                >
                  <option value="">Select district...</option>
                  {districts.map((d) => (
                    <option key={d.code} value={d.code}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ward</label>
                <select
                  value={wardCode}
                  onChange={(e) => isEditable && setWardCode(e.target.value)}
                  disabled={!districtCode || !isEditable}
                  className={`w-full border-gray-300 rounded-xl px-4 py-2.5 border focus:ring-2 focus:ring-black focus:border-black transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%207l5%205%205-5%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_12px_center] bg-no-repeat ${
                    !districtCode || !isEditable ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "bg-white"
                  }`}
                >
                  <option value="">Select ward...</option>
                  {wards.map((w) => (
                    <option key={w.code} value={w.code}>{w.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => isEditable && setAddress(e.target.value)}
                className={`w-full border-gray-300 rounded-xl px-4 py-2.5 border focus:ring-2 focus:ring-black focus:border-black transition-all ${
                  !isEditable ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "bg-white"
                }`}
                placeholder="123 Example Street..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVITIES + SLOTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ACTIVITIES */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Itinerary</h2>
              <p className="text-sm text-gray-500">The schedule of activities.</p>
            </div>
            {isEditable && (
              <button
                onClick={() => {
                  if (activities.length >= 5) {
                    toast.error("You cannot add more than 5 activities");
                    return;
                  }
                  setShowAddActivityModal(true);
                }}
                className="bg-white border text-gray-900 border-gray-200 hover:border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                Add Activity
              </button>
            )}
          </div>
          
          <div className="space-y-3 flex-1">
            {activities.length > 0 ? activities.map((a, index) => (
              <div
                key={a.id}
                className="flex items-center gap-4 bg-white border border-gray-100 p-4 rounded-xl hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 group-hover:bg-gray-200 transition-colors">
                  {index + 1}
                </div>
                {a.image_url ? (
                  <img src={a.image_url} alt={a.title} className="w-16 h-16 object-cover rounded-lg shadow-sm" />
                ) : (
                  <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 text-xs border border-gray-100">
                    No img
                  </div>
                )}

                <div className="flex flex-col justify-center flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{a.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5 truncate">{a.description || "No description provided."}</p>
                </div>

                {isEditable && (
                  <button
                    onClick={() => setEditingActivity(a)}
                    className="flex-shrink-0 bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200">
                <p className="text-gray-500 font-medium">No activities yet</p>
                <p className="text-sm text-gray-400 mt-1">Add activities to build your experience itinerary.</p>
              </div>
            )}
          </div>
        </div>

        {/* SLOTS */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Availability Slots</h2>
              <p className="text-sm text-gray-500">Manage booking time periods.</p>
            </div>
            {isEditable && (
              <button
                onClick={() => setShowAddSlotModal(true)}
                className="bg-white border text-gray-900 border-gray-200 hover:border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                Add Slot
              </button>
            )}
          </div>

          <div className="space-y-3 flex-1">
            {slots.length > 0 ? slots.map((slot) => (
              <div
                key={slot.id}
                className={`flex justify-between items-center p-4 rounded-xl border transition-all duration-300 ${
                  slot.is_active ? 'bg-white border-gray-200 hover:shadow-md' : 'bg-gray-50 border-gray-100 opacity-80'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${slot.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={`font-semibold ${slot.is_active ? 'text-gray-900' : 'text-gray-500'}`}>
                        {slot.start_time.slice(11, 16)} - {slot.end_time.slice(11, 16)}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Capacity: <span className="font-medium text-gray-700">{slot.max_attendees} pax</span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (!isEditable) return;
                      setEditingSlot(slot);
                      setStartTime(slot.start_time.slice(11, 16));
                      setEndTime(slot.end_time.slice(11, 16));
                      setMaxAttendees(slot.max_attendees);
                    }}
                    disabled={!isEditable}
                    className="bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => toggleSlot(slot.id, slot.is_active)}
                    disabled={!isEditable}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors min-w-[80px] disabled:opacity-50 ${
                      slot.is_active
                        ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                        : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                    }`}
                  >
                    {slot.is_active ? "Active" : "Hidden"}
                  </button>
                </div>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200">
                <p className="text-gray-500 font-medium">No slots defined</p>
                <p className="text-sm text-gray-400 mt-1">Add slots to allow guests to book this experience.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SLOT MODAL */}
      {editingSlot && isEditable && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-7 rounded-2xl w-[400px] shadow-2xl animate-[fadeIn_0.2s_ease-out]">
            <div className="mb-6">
              <h2 className="font-bold text-xl text-gray-900">Edit Time Slot</h2>
              <p className="text-sm text-gray-500 mt-1">Update schedule details</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full border-gray-300 rounded-xl px-4 py-2.5 border focus:ring-2 focus:ring-black focus:border-black transition-all bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full border-gray-300 rounded-xl px-4 py-2.5 border focus:ring-2 focus:ring-black focus:border-black transition-all bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Maximum Attendees</label>
                <input
                  type="number"
                  value={maxAttendees}
                  onChange={(e) => setMaxAttendees(Number(e.target.value))}
                  min={1}
                  className="w-full border-gray-300 rounded-xl px-4 py-2.5 border focus:ring-2 focus:ring-black focus:border-black transition-all bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
               <button
                 onClick={() => setEditingSlot(null)}
                 className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
               >
                 Cancel
               </button>
               <button
                 onClick={updateSlot}
                 className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-black shadow-sm transition-colors"
               >
                 Save Slot
               </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD MODALS */}
      {showAddSlotModal && experience && (
        <AddSlotModal
          experienceId={experience.id}
          onClose={() => setShowAddSlotModal(false)}
          onAdd={(newSlots) => setSlots((prev) => [...prev, ...newSlots])}
        />
      )}

      {showAddActivityModal && experience && (
        <AddActivityModal
          listingId={id}
          experienceId={experience.id}
          activities={activities}
          onClose={() => setShowAddActivityModal(false)}
          onUpdate={(updatedActivities) => setActivities(updatedActivities)}
          onAddImage={(newImage) => setImages((prev) => [newImage, ...prev])}
        />
      )}

      {editingActivity && experience?.id && (
        <EditActivityModal
          experienceId={experience.id}
          activity={editingActivity}
          onClose={() => setEditingActivity(null)}
          onUpdate={(updated) => {
            // Cập nhật state activities
            setActivities((prev) =>
              prev.map((a) => (a.id === updated.id ? updated : a)),
            );
          }}
          loadImages={loadImages} // Pass loadImages để reload ảnh ngay
        />
      )}

      {/* VOUCHERS */}
      <CreateVoucherModal
        open={voucherModalOpen}
        onOpenChange={setVoucherModalOpen}
        listingId={id}
        onCreated={async () => {
          const vs = await getVouchersByListingId(id);
          setVouchers(vs);
        }}
      />
      {editingVoucher && (
        <EditVoucherModal
          open={true}
          onOpenChange={(open) => { if (!open) setEditingVoucher(null); }}
          voucher={editingVoucher}
          onUpdated={async () => {
            const vs = await getVouchersByListingId(id);
            setVouchers(vs);
            setEditingVoucher(null);
          }}
        />
      )}
      {vouchers.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Vouchers</h2>
          <div className="space-y-3">
            {vouchers.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:shadow-md transition-all"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{v.code}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Discount: {v.discount_value}
                    {v.min_price != null ? ` · Min: ${v.min_price}` : ""}
                    {v.max_discount != null ? ` · Max off: ${v.max_discount}` : ""}
                    {v.usage_limit != null ? ` · Used: ${v.used_count ?? 0}/${v.usage_limit}` : ""}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
                    v.is_active
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {v.is_active ? "Active" : "Inactive"}
                </span>
                <button
                  type="button"
                  onClick={() => setEditingVoucher(v)}
                  className="shrink-0 rounded-full border border-slate-100 bg-white px-6 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
