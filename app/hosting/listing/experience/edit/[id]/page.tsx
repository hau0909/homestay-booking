"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Experience } from "@/src/types/experience";
import { ExperienceActivity } from "@/src/types/experienceActivity";
import { ExperienceSlot } from "@/src/types/experienceSlot";
import { District, Province, Ward } from "@/src/types/location";

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

import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { ListingImage } from "@/src/types/listingImages";
import { getListingImagesForEdit } from "@/src/services/listing/getListingImagesForEdit";
import { updateListingImageForEdit } from "@/src/services/listing/updateListingImageForEdit";
import { uploadListingImageForEdit } from "@/src/services/listing/uploadListingImageForEdit";
import { saveLocation } from "@/src/services/listing/saveLocation";
import { updateListing } from "@/src/services/listing/updateListing";

export default function EditExperiencePage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const [experience, setExperience] = useState<Experience | null>(null);
  const [activities, setActivities] = useState<ExperienceActivity[]>([]);
  const [slots, setSlots] = useState<ExperienceSlot[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingSlot, setEditingSlot] = useState<ExperienceSlot | null>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [maxAttendees, setMaxAttendees] = useState(1);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [images, setImages] = useState<ListingImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<ListingImage | null>(null);

  const [provinceCode, setProvinceCode] = useState("");
  const [districtCode, setDistrictCode] = useState("");
  const [wardCode, setWardCode] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (!id) return;

    loadExperience();
    getProvinces().then(setProvinces);
    loadLocation(String(id));
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
    if (!id) return;
    loadImages();
  }, [id]);

  const loadImages = async () => {
    const data = await getListingImagesForEdit(Number(id));
    setImages(data);
  };
  const loadLocation = async (listingId: string) => {
    const listing = await getListingForEdit(listingId);

    if (!listing) {
      toast.error("Listing not found");
      return;
    }

    setProvinceCode(listing.province_code || "");
    setDistrictCode(listing.district_code || "");
    setWardCode(listing.ward_code || "");
    setAddress(listing.address_detail || "");
  };
  const handleReplaceImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    imageId: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imageUrl = await uploadListingImageForEdit(file);

      await updateListingImageForEdit(imageId, imageUrl);

      await loadImages();

      setSelectedImage(null);
    } catch (err) {
      console.error(err);
    }
  };
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

    setLoading(false);
  };

  const handleUpdateExperience = async () => {
    if (!experience) return;

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
      // update listing
      await updateListing(id, {
        title: experience.title,
        description: experience.description,
        province_code: provinceCode,
        district_code: districtCode,
        ward_code: wardCode,
        address_detail: address,
      });
      toast.success("Experience updated");
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    }
  };

  const toggleSlot = async (slotId: number, status: boolean) => {
    const success = await toggleExperienceSlotStatus(slotId, status);

    if (!success) {
      toast.error("Update failed");
      return;
    }

    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, is_active: !status } : s)),
    );
  };

  const updateSlot = async () => {
    if (!editingSlot) return;

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

    toast.success("Slot updated");

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

    setEditingSlot(null);
  };

  if (loading) return <div className="p-10">Loading...</div>;
  if (!experience) return <div className="p-10">Experience not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-8 py-6 space-y-6">
      {/* HEADER */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-700 hover:text-black mb-4"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <h1 className="text-3xl font-bold">Edit Experience</h1>

        <p className="text-gray-500 mt-1">
          Manage experience information and slots
        </p>
      </div>
      {/* EXPERIENCE IMAGES */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {images.map((img) => (
          <img
            key={img.id}
            src={img.url}
            className="w-full h-24 object-cover rounded-lg border cursor-pointer hover:opacity-80"
            onClick={() => setSelectedImage(img)}
          />
        ))}
      </div>

      {/* EXPERIENCE INFO FULL WIDTH */}
      <div className="bg-white border rounded-xl p-5 shadow-sm">
        <h2 className="font-semibold mb-4">Experience Info</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* LEFT INFO */}
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Title</label>
              <input
                value={experience.title}
                onChange={(e) =>
                  setExperience({ ...experience, title: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Description</label>
              <textarea
                value={experience.description || ""}
                onChange={(e) =>
                  setExperience({
                    ...experience,
                    description: e.target.value,
                  })
                }
                rows={3}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Price per person</label>

              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>

                <input
                  type="number"
                  value={experience.price_per_person}
                  onChange={(e) =>
                    setExperience({
                      ...experience,
                      price_per_person: Number(e.target.value),
                    })
                  }
                  className="w-full border rounded-lg pl-7 pr-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* RIGHT ADDRESS */}
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Province</label>
              <select
                value={provinceCode}
                onChange={(e) => setProvinceCode(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              >
                <option value="">Select province</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600">District</label>
              <select
                value={districtCode}
                onChange={(e) => setDistrictCode(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              >
                <option value="">Select district</option>
                {districts.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600">Ward</label>
              <select
                value={wardCode}
                onChange={(e) => setWardCode(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              >
                <option value="">Select ward</option>
                {wards.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-5">
          <button
            onClick={handleUpdateExperience}
            className="bg-black text-white px-4 py-2 rounded-lg"
          >
            Save Experience
          </button>
        </div>
      </div>

      {/* ACTIVITIES + SLOTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* ACTIVITIES */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-lg">Activities</h2>
              <p className="text-xs text-gray-500">
                Activities included in this experience
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {activities.map((a) => (
              <div
                key={a.id}
                className="flex gap-4 border rounded-lg p-4 hover:bg-gray-50 transition"
              >
                {a.image_url && (
                  <img
                    src={a.image_url}
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                )}

                <div className="flex flex-col justify-center">
                  <p className="font-semibold text-gray-900">{a.title}</p>

                  <p className="text-sm text-gray-500 mt-1 max-w-md">
                    {a.description || "No description"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SLOTS */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="font-semibold text-lg">Experience Slots</h2>
            <p className="text-xs text-gray-500">
              Time slots available for booking
            </p>
          </div>

          <div className="space-y-4">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50 transition"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {slot.start_time.slice(11, 16)} -{" "}
                    {slot.end_time.slice(11, 16)}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Max attendees: {slot.max_attendees}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingSlot(slot);
                      setStartTime(slot.start_time.slice(11, 16));
                      setEndTime(slot.end_time.slice(11, 16));
                      setMaxAttendees(slot.max_attendees);
                    }}
                    className="border px-3 py-1 rounded-lg text-sm hover:bg-gray-100"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => toggleSlot(slot.id, slot.is_active)}
                    className={`px-3 py-1 rounded-lg text-sm text-white ${
                      slot.is_active
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-gray-400 hover:bg-gray-500"
                    }`}
                  >
                    {slot.is_active ? "Active" : "Inactive"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SLOT MODAL */}
      {editingSlot && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-[420px] space-y-5 shadow-lg">
            <div>
              <h2 className="font-semibold text-lg">Edit Slot</h2>
              <p className="text-xs text-gray-500">
                Update the time and capacity of this experience slot
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Start time</p>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">End time</p>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Max attendees</p>
              <input
                type="number"
                value={maxAttendees}
                onChange={(e) => setMaxAttendees(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingSlot(null)}
                className="border px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={updateSlot}
                className="bg-black text-white px-4 py-2 rounded-lg hover:opacity-90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-white p-6 rounded-xl w-[520px] space-y-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h2 className="text-lg font-semibold">Edit Image</h2>
              <p className="text-xs text-gray-500">
                Replace the image for this experience
              </p>
            </div>

            {/* IMAGE PREVIEW */}
            <div className="relative group">
              <img
                src={selectedImage.url}
                className="w-full h-[260px] object-cover rounded-lg"
              />

              <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition rounded-lg cursor-pointer">
                Change Image
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) =>
                    selectedImage && handleReplaceImage(e, selectedImage.id)
                  }
                />
              </label>
            </div>

            {/* BUTTONS */}
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedImage(null)}
                className="border px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
