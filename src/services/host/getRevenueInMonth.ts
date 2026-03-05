import { supabase } from "@/src/lib/supabase"

export async function getRevenueInMonth(hostId: string) {
  // 1️⃣ Lấy listings của host
  const { data: listings, error: listingError } = await supabase
    .from("listings")
    .select("id")
    .eq("host_id", hostId)

  if (listingError) throw listingError

  const listingIds = listings?.map(l => l.id) ?? []
  if (listingIds.length === 0) return []

  // 2️⃣ Tính ngày đầu & cuối tháng hiện tại (LOCAL TIME)
  const today = new Date()

  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  // Format YYYY-MM-DD theo LOCAL (không dùng toISOString)
  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const startDate = formatDate(firstDay)
  const endDate = formatDate(lastDay)

  // 3️⃣ Lấy booking trong tháng hiện tại
  const { data: bookings, error: bookingError } = await supabase
    .from("bookings")
    .select("check_out_date, total_price, status")
    .in("listing_id", listingIds)
    .gte("check_out_date", startDate)
    .lte("check_out_date", endDate)

  if (bookingError) throw bookingError

  const validBookings =
    bookings?.filter(b => b.status === "COMPLETED") ?? []

  // 4️⃣ Gom revenue theo ngày
  const revenueMap: Record<string, number> = {}

  validBookings.forEach(b => {
    const date = b.check_out_date
    revenueMap[date] = (revenueMap[date] || 0) + Number(b.total_price)
  })

  // 5️⃣ Tạo array đủ số ngày trong tháng
  const daysInMonth = lastDay.getDate()
  const result = []

  for (let i = 1; i <= daysInMonth; i++) {
    const current = new Date(today.getFullYear(), today.getMonth(), i)
    const dateStr = formatDate(current)

    result.push({
      date: dateStr,
      revenue: revenueMap[dateStr] || 0,
    })
  }

  return result
}