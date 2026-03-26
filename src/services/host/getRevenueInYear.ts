import { supabase } from "@/src/lib/supabase"

export async function getRevenueInYear(hostId: string) {
  // 1️⃣ Lấy listings
  const { data: listings, error: listingError } = await supabase
    .from("listings")
    .select("id")
    .eq("host_id", hostId)

  if (listingError) throw listingError

  const listingIds = listings?.map(l => l.id) ?? []
  if (listingIds.length === 0) return []

  // 2️⃣ Tính năm hiện tại
  const today = new Date()
  const year = today.getFullYear()

  const startDate = `${year}-01-01`
  const endDate = `${year}-12-31`

  // 3️⃣ Lấy booking
  const { data: bookings, error: bookingError } = await supabase
    .from("bookings")
    .select("check_out_date, total_price, status")
    .in("listing_id", listingIds)
    .gte("check_out_date", startDate)
    .lte("check_out_date", endDate)

  if (bookingError) throw bookingError

  const validBookings =
    bookings?.filter(b => b.status === "COMPLETED" || b.status === "PAID") ?? []

  // 4️⃣ Gom revenue theo tháng
  const revenueMap: Record<number, number> = {}

  validBookings.forEach(b => {
    const month = new Date(b.check_out_date).getMonth() // 0-11
    revenueMap[month] = (revenueMap[month] || 0) + b.total_price
  })

  // 5️⃣ Tạo đủ 12 tháng
  const result = []

  for (let i = 0; i < 12; i++) {
    result.push({
      date: `${year}-${String(i + 1).padStart(2, "0")}`,
      revenue: revenueMap[i] || 0,
    })
  }

  return result
}