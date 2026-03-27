"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CompactSearchBar from "@/src/components/search/CompactSearchBar";
import {
  getListingDetail,
  ListingDetailWithHost,
} from "@/src/services/listing/getListingDetail";
import { getHostInfo, HostInfo } from "@/src/services/profile/getHostInfo";
import { getHomeByListingId } from "@/src/services/home/getHomeByListingId";
import { Home } from "@/src/types/home";
import { getExperienceSlotsByListingId } from "@/src/services/experience/getExperienceSlotsByListingId";
import { ExperienceSlot } from "@/src/types/experienceSlot";
import { getExperienceActivitiesByListingId } from "@/src/services/experience/getExperienceActivitiesByListingId";
import { ExperienceActivity } from "@/src/types/experienceActivity";
import ExperienceActivities from "@/src/components/listing/ExperienceActivities";
import {
  Users,
  Bed,
  Bath,
  MapPin,
  Share2,
  Heart,
  Grid3x3,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import ListingRatings from "@/src/components/listing/ListingRatings";
import { supabase } from "@/src/lib/supabase";
import { MessageCircleMore } from "lucide-react";
import HostResponseForm from "@/src/components/listing/HostResponseForm";
import { getHostResponseByReviewId } from "@/src/services/listing/getHostResponseByReviewId";
import ChatModal from "@/src/components/home/chatModal";
import { getOrCreateConversation } from "@/src/services/chat/getOrCreateConversation";
import toast from "react-hot-toast";
import { getListingRules } from "@/src/services/listing/getListingRules";
import { Rule } from "@/src/types/rule";
import { getPoliciesByListingIds } from "@/src/services/cancel-policy/getPoliciesByListingIds";
import type { CancelPolicy } from "@/src/types/cancel-policy";
import { getVouchersByListingId } from "@/src/services/voucher/getVouchersByListingId";
import type { Voucher } from "@/src/types/voucher";
import ListingBookingVouchers from "@/src/components/listing/ListingBookingVouchers";

export default function ListingDetailPage() {
  const params = useParams();
  const listingId = params.id as string;

  const [listing, setListing] = useState<ListingDetailWithHost | null>(null);
  const [host, setHost] = useState<HostInfo | null>(null);
  const [home, setHome] = useState<Home | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [cancelPolicies, setCancelPolicies] = useState<CancelPolicy[]>([]);
  const [bookingVouchers, setBookingVouchers] = useState<Voucher[]>([]);
  const [slots, setSlots] = useState<ExperienceSlot[]>([]);
  const [activities, setActivities] = useState<ExperienceActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [user, setUser] = useState<any>(null);

  type ActiveChat = {
    id?: string;
    conversation_id: string;
    full_name: string;
    avatar: string;
    last_message?: string;
    last_message_sender_id?: number;
    is_read?: boolean;
    is_host: boolean;
  };
  const [activeChat, setActiveChat] = useState<ActiveChat | null>(null);

  const handleChatClick = async () => {
    if (!user) {
      toast.error("Please login to chat with host!");
      return;
    }

    if (!host) return;

    const conversation = await getOrCreateConversation(host.id, user.id);

    setActiveChat({
      conversation_id: conversation.id,
      full_name: host.full_name ?? "",
      avatar: host.avatar_url ?? "",
      is_host: false,
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();
        setUser(currentUser);

        const listingData = await getListingDetail(listingId);
        setListing(listingData);

        // Fetch home data directly
        const homeData = await getHomeByListingId(listingId);
        setHome(homeData);

        // Fetch rules
        const rulesData = await getListingRules(parseInt(listingId));
        setRules(rulesData);

        try {
          const policyMap = await getPoliciesByListingIds([parseInt(listingId, 10)]);
          const list = policyMap[parseInt(listingId, 10)];
          setCancelPolicies(list ?? []);
        } catch {
          setCancelPolicies([]);
        }

        try {
          const allVouchers = await getVouchersByListingId(parseInt(listingId, 10));
          setBookingVouchers(allVouchers ?? []);
        } catch {
          setBookingVouchers([]);
        }

        // Fetch slots if it's an experience
        if (listingData?.listing_type === "EXPERIENCE") {
          const slotsData = await getExperienceSlotsByListingId(listingId);
          setSlots(slotsData);
          
          const activitiesData = await getExperienceActivitiesByListingId(listingId);
          setActivities(activitiesData);
        }

        if (listingData?.host_id) {
          const hostData = await getHostInfo(listingData.host_id);
          setHost(hostData);
        }
      } catch (error) {
        console.error("Error fetching listing:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [listingId]);

  const formatPrice = (price: number | null) => {
    if (!price) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3">
          <div className="max-w-[1920px] mx-auto">
            <CompactSearchBar />
          </div>
        </header>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#328E6E]"></div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-white">
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3">
          <div className="max-w-[1920px] mx-auto">
            <CompactSearchBar />
          </div>
        </header>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Listing not found</h2>
            <Link href="/" className="text-[#328E6E] hover:underline">
              Return to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Image Gallery Modal
  if (showGallery) {
    return (
      <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 flex items-center justify-between z-10">
          <button
            onClick={() => setShowGallery(false)}
            className="text-black hover:bg-gray-200 p-2 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-black hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-semibold underline">Share</span>
            </button>
            <button
              onClick={() => setIsLiked(!isLiked)}
              className="flex items-center gap-2 text-black hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
            >
              <Heart
                className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
              />
              <span className="text-sm font-semibold underline">Save</span>
            </button>
          </div>
        </div>

        {/* Images Grid */}
        <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {listing.all_images.map((image, index) => (
            <div key={index} className="relative aspect-[4/3]">
              <img
                src={image}
                alt={`${listing.title} - Image ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-[1920px] mx-auto">
          <CompactSearchBar isExperience={listing?.listing_type === "EXPERIENCE"} />
        </div>
      </header>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Title & Actions */}
        <div className="flex flex-col mb-6">
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Share2 className="w-4 h-4 text-black" />
                <span className="text-sm font-semibold text-black underline">
                  Share
                </span>
              </button>
              <button
                onClick={() => setIsLiked(!isLiked)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Heart
                  className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : "text-black"}`}
                />
                <span className="text-sm font-semibold text-black underline">
                  Save
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Images Grid */}
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[500px] mb-8 rounded-2xl overflow-hidden">
          {listing.all_images.length > 0 ? (
            <>
              {/* Main Image - Takes left half */}
              <div className="col-span-2 row-span-2 relative">
                <img
                  src={listing.all_images[0]}
                  alt={listing.title}
                  className="w-full h-full object-cover cursor-pointer hover:brightness-90 transition-all"
                  onClick={() => {
                    /* TODO: Open image gallery */
                  }}
                />
              </div>

              {/* Right side - 4 smaller images */}
              {listing.all_images.slice(1, 5).map((image, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={image}
                    alt={`${listing.title} ${idx + 2}`}
                    className="w-full h-full object-cover cursor-pointer hover:brightness-90 transition-all"
                    onClick={() => setShowGallery(true)}
                  />
                  {idx === 3 && (
                    <button
                      onClick={() => setShowGallery(true)}
                      className="absolute bottom-4 right-4 bg-white hover:bg-gray-100 px-4 py-2 rounded-lg flex items-center gap-2 border border-gray-900 transition-colors text-black"
                    >
                      <Grid3x3 className="w-4 h-4 text-black" />
                      <span className="text-sm font-semibold text-black">
                        Show all photos
                      </span>
                    </button>
                  )}
                </div>
              ))}
            </>
          ) : (
            <div className="col-span-4 row-span-2 bg-gray-200 flex items-center justify-center">
              <p className="text-gray-500">No images available</p>
            </div>
          )}
        </div>


        {/* Content Grid */}
        <div className="grid grid-cols-3 gap-12">
          {/* Left Column - Details */}
          <div className="col-span-2">
          
            {/* Title & Description Below Image */}
            <div className="mb-6">
              <h1 className="text-2xl font-extrabold leading-tight text-black">
                {listing.title}
              </h1>
              <p className="text-gray-600 mt-2 text-base">
                {listing.description}
              </p>
            </div>

            {listing.listing_type === "EXPERIENCE" ? (
              <div className="text-sm text-gray-700 flex flex-col gap-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex flex-col justify-center">
                    <div className="flex gap-2 items-start mb-3">
                      <MapPin className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                      <span className="font-medium text-black text-base">
                        {[
                          listing.address_detail,
                          listing.ward_name,
                          listing.district_name,
                          listing.province_name,
                        ]
                          .filter(Boolean)
                          .join(", ") || "N/A"}
                      </span>
                    </div>
                    <div className="flex gap-4 items-center pt-3 border-t border-gray-200">
                      <span className="font-semibold uppercase text-xs text-gray-500">Price:</span>
                      <span className="font-bold text-[#328E6E] text-lg">
                        {listing.price_weekday ? `${formatPrice(listing.price_weekday)} / person` : "Chưa có giá"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="text-sm text-gray-700 flex flex-wrap gap-x-6 gap-y-2">
                  <span>
                    <strong>quantity:</strong> {home?.quantity ?? ""}
                  </span>
                  <span>
                    <strong>max_guests:</strong> {home?.max_guests ?? ""}
                  </span>
                  <span>
                    <strong>room_size:</strong> {home?.room_size ?? ""}
                  </span>
                </div>
                <div className="text-sm text-gray-700 flex flex-wrap gap-x-6 gap-y-2 mt-1">
                  <span>
                    <strong>bed_count:</strong> {home?.bed_count ?? ""}
                  </span>
                  <span>
                    <strong>bath_count:</strong> {home?.bath_count ?? ""}
                  </span>
                </div>
              </>
            )}
            <div className="w-2/3 border-b border-gray-200 mt-5"></div>

            {/* House Rules Section */}
            {listing.listing_type !== "EXPERIENCE" && (
              <div className="mt-6">
                <h3 className="text-lg font-bold mb-4 text-black">House Rules</h3>
                {rules.length > 0 ? (
                  <ul className="space-y-2">
                    {rules.map((rule) => (
                      <li key={rule.id} className="text-sm text-gray-700 flex items-start gap-3">
                        <span className="text-gray-400 mt-1">✔</span>
                        <span>{rule.content}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No house rules</p>
                )}
              </div>
            )}

            {/* Experience Activities Timeline */}
            {/* Removed from here, moved to right column */}

            {/* Host Info */}
            <div className="pb-6 border-b border-gray-200">
              <div className="flex items-center gap-4 mt-6">
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                  {host?.avatar_url ? (
                    <img
                      src={host.avatar_url}
                      alt={host.full_name || "Host"}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <Users className="w-6 h-6 text-gray-600" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-black">
                    Host: {host?.full_name || ""}
                  </p>
                  <p className="text-sm text-gray-500">New host</p>
                </div>
                {user?.id !== host?.id && (
                  <button
                    className="hover:text-gray-600 cursor-pointer hover:-translate-y-1 transition-all duration-300"
                    onClick={handleChatClick}
                  >
                    <MessageCircleMore size={30} />
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="col-span-1 flex flex-col gap-8">
            
            {/* Detailed Activity Schedule for Experiences */}
            {listing.listing_type === "EXPERIENCE" && activities.length > 0 && (
              <div className="bg-white">
                <ExperienceActivities activities={activities} />
              </div>
            )}



            {/* Booking + cancellation policy: sticky together while scrolling */}
            <div className="sticky top-24 z-10 flex w-full max-w-full flex-col gap-3 self-start">
              <div className="rounded-2xl border border-gray-300 bg-white p-6 shadow-lg">
                {listing.listing_type !== "EXPERIENCE" ? (
                  <>
                    <div className="mb-6 flex items-baseline gap-2">
                      <span className="text-2xl font-semibold text-black underline">
                        {formatPrice(listing.price_weekday)}
                      </span>
                      <span className="text-black">/ weekday night</span>
                    </div>
                    <div className="mb-6 flex items-baseline gap-2">
                      <span className="text-2xl font-semibold text-black underline">
                        {formatPrice(listing.price_weekend)}
                      </span>
                      <span className="text-black">/ weekend night</span>
                    </div>
                  </>
                ) : null}

                {bookingVouchers.length > 0 ? (
                  <ListingBookingVouchers
                    vouchers={bookingVouchers}
                    formatPrice={formatPrice}
                  />
                ) : null}

                {!(user && host && user.id === host.id) && (
                  <>
                    {listing.listing_type === "EXPERIENCE" ? (
                      <Link href={`/book/experiences?listing=${listingId}`}>
                        <button
                          className={`w-full rounded-lg bg-gradient-to-r from-pink-500 to-red-500 py-3 font-semibold text-white transition-all hover:from-pink-600 hover:to-red-600 ${bookingVouchers.length === 0 ? "mt-4" : ""}`}
                        >
                          Book Now
                        </button>
                      </Link>
                    ) : (
                      <Link href={`/book/homes?listing=${listingId}`}>
                        <button className="w-full rounded-lg bg-gradient-to-r from-pink-500 to-red-500 py-3 font-semibold text-white transition-all hover:from-pink-600 hover:to-red-600">
                          Book Now
                        </button>
                      </Link>
                    )}
                  </>
                )}
              </div>

              {cancelPolicies.length > 0 ? (
                <ListingCancelPolicySnippet policies={cancelPolicies} />
              ) : null}
            </div>
          </div>
        </div>

        {/* Host Info Section */}
        {/* <div className="mt-12 mr-auto w-2/3">
          <div className="pb-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                {host?.avatar_url ? (
                  <img
                    src={host.avatar_url}
                    alt={host.full_name || "Host"}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <Users className="w-6 h-6 text-gray-600" />
                )}
              </div>
            </div>
          </div>
        </div> */}
      </div>

      <hr className="mx-auto w-200 my-10" />

      {/* Lisiting avg ratings */}
      <div className="my-10">
        <ListingRatings listingId={Number(listingId)} />
      </div>

      {/* trietcmce180982_sprint2 */}
      {/* reiews */}
      <ReviewsSection listingId={listingId} />

      {/* Chat Modal */}
      {activeChat && (
        <ChatModal chat={activeChat} onClose={() => setActiveChat(null)} />
      )}
    </div>
  );
}

function ListingCancelPolicySnippet({
  policies,
}: {
  policies: CancelPolicy[];
}) {
  return (
    <aside className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h4 className="mb-3 text-sm font-bold text-gray-900">
        Cancellation Policy
      </h4>
      <div className="flex flex-col gap-3">
        {policies.map((p) => (
          <div
            key={p.id}
            className="rounded-lg border border-gray-100 bg-gray-50 p-3"
          >
            <div className="mb-2 text-sm font-semibold text-gray-900">
              {p.name?.trim() || "—"}
            </div>
            {p.description?.trim() ? (
              <div className="mb-2 text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                {p.description.trim()}
              </div>
            ) : null}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
              {p.cancel_before_hours != null && (
                <span>
                  Cancel before{" "}
                  <span className="font-medium text-gray-700">
                    {p.cancel_before_hours}h
                  </span>
                </span>
              )}
              {p.refund_percentage != null && (
                <span>
                  Refund{" "}
                  <span className="font-medium text-gray-700">
                    {p.refund_percentage}%
                  </span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function ReviewsSection({ listingId }: { listingId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [hostId, setHostId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      // Lấy hostId của listing
      const { data: listingData } = await supabase
        .from("listings")
        .select("host_id")
        .eq("id", listingId)
        .single();
      setHostId(listingData?.host_id || null);
      // Lấy is_host của user hiện tại
      let isHostFlag = false;
      if (user) {
        const { getHostInfo } =
          await import("@/src/services/profile/getHostInfo");
        const hostProfile = await getHostInfo(user.id);
        isHostFlag = !!hostProfile?.is_host;
      }
      setIsHost(isHostFlag);
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select("*, profiles(full_name, avatar_url)")
        .eq("listing_id", listingId)
        .order("created_at", { ascending: false });
      // Lấy ảnh và host response cho từng review
      const reviewsWithExtras = await Promise.all(
        (reviewsData || []).map(async (review: any) => {
          const { data: imagesData } = await supabase
            .from("review_images")
            .select("url")
            .eq("review_id", review.id);
          // Lấy host response
          const response = await getHostResponseByReviewId(review.id);
          return {
            ...review,
            images: imagesData ? imagesData.map((img: any) => img.url) : [],
            hostResponse: response,
          };
        }),
      );
      setReviews(reviewsWithExtras);
      if (user) {
        const reviewed = (reviewsWithExtras || []).some(
          (r: any) => r.user_id === user.id,
        );
        setHasReviewed(reviewed);
        const { data: bookings } = await supabase
          .from("bookings")
          .select("id, status")
          .eq("listing_id", listingId)
          .eq("user_id", user.id);
        const confirmedBooking =
          Array.isArray(bookings) &&
          bookings.some((b: any) => b.status === "confirmed");
        setCanReview(!reviewed && confirmedBooking);
      }
      setLoading(false);
    };
    fetchData();
  }, [listingId]);

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold mb-4">Reviews</h2>
      {user && canReview && !hasReviewed && !showReviewForm && (
        <button
          className="bg-[#328E6E] text-white px-4 py-2 rounded hover:bg-[#256b52] mb-4"
          onClick={() => setShowReviewForm(true)}
        >
          Viết đánh giá
        </button>
      )}
      {user && canReview && !hasReviewed && showReviewForm && (
        <ReviewForm
          listingId={listingId}
          userId={user.id}
          onSuccess={() => window.location.reload()}
        />
      )}
      {user && hasReviewed && (
        <div className="mb-4 text-green-600">Bạn đã đánh giá homestay này.</div>
      )}
      {reviews.length === 0 && <div>Chưa có đánh giá nào.</div>}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              {review.profiles?.avatar_url ? (
                <img
                  src={review.profiles.avatar_url}
                  alt="avatar"
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-300" />
              )}
              <span className="font-semibold">
                {review.profiles?.full_name || "User"}
              </span>
              <span className="ml-2 text-yellow-500">
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
              </span>
            </div>
            {/* Hiển thị comment */}
            <div className="mb-2">{review.comment || review.content}</div>
            {/* Hiển thị ảnh upload */}
            {review.images && review.images.length > 0 && (
              <div className="flex gap-2 mt-2">
                {review.images.map((img: string, idx: number) => (
                  <img
                    key={idx}
                    src={img}
                    alt="review-img"
                    className="w-20 h-20 object-cover rounded"
                  />
                ))}
              </div>
            )}
            <div className="text-xs text-gray-400 mt-1">
              {new Date(review.created_at).toLocaleString()}
            </div>
            {/* Hiển thị phản hồi của chủ nhà */}
            {review.hostResponse ? (
              <div className="mt-3 ml-6 p-3 border-l-4 border-green-400 bg-green-50 rounded">
                <div className="font-semibold text-green-700 mb-1">
                  Phản hồi của chủ nhà:
                </div>
                <div>{review.hostResponse.content}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(review.hostResponse.created_at).toLocaleString()}
                </div>
              </div>
            ) : (
              user &&
              hostId &&
              user.id === hostId &&
              isHost && (
                <div className="mt-3 ml-6">
                  <HostResponseForm
                    reviewId={String(review.id)}
                    hostId={hostId}
                    onSuccess={() => window.location.reload()}
                  />
                </div>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewForm({
  listingId,
  userId,
  onSuccess,
}: {
  listingId: string;
  userId: string;
  onSuccess?: () => void;
}) {
  const [rating, setRating] = useState<number>(0);
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Upload images
      let imageUrls: string[] = [];
      if (images.length > 0) {
        for (const file of images) {
          const { data, error } = await supabase.storage
            .from("review-images")
            .upload(`${listingId}/${userId}/${file.name}`, file);
          if (error) throw error;
          imageUrls.push(data.path);
        }
      }
      // Insert review
      const { error: reviewError } = await supabase.from("reviews").insert([
        {
          listing_id: listingId,
          user_id: userId,
          rating,
          content,
          images: imageUrls,
          created_at: new Date().toISOString(),
        },
      ]);
      if (reviewError) throw reviewError;
      if (onSuccess) onSuccess();
    } catch (err) {
      let msg = "Lỗi gửi đánh giá";
      if (err && typeof err === "object" && "message" in err) {
        msg = (err as any).message || msg;
      }
      setError(msg);
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 p-4 border rounded-lg bg-gray-50"
    >
      <div className="mb-2">
        <label className="block font-semibold mb-1">Comment:</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              className={
                star <= rating
                  ? "text-yellow-500 text-2xl"
                  : "text-gray-300 text-2xl"
              }
              onClick={() => setRating(star)}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <div className="mb-2">
        <label className="block font-semibold mb-1">Nội dung đánh giá:</label>
        <textarea
          className="w-full border rounded p-2"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>
      <div className="mb-2">
        <label className="block font-semibold mb-1">Ảnh kèm theo:</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
        />
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <button
        type="submit"
        className="bg-[#328E6E] text-white px-4 py-2 rounded hover:bg-[#256b52]"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
