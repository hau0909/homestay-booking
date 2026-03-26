import { supabase } from "@/src/lib/supabase"

export async function getRevenueInWeek(hostId: string) {
  // 1️⃣ Lấy listings của host
  const { data: listings, error: listingError } = await supabase
    .from("listings")
    .select("id")
    .eq("host_id", hostId)

  if (listingError) throw listingError

  const listingIds = listings?.map(l => l.id) ?? []
  if (listingIds.length === 0) return []

  // Helper format YYYY-MM-DD theo LOCAL
  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  // 2️⃣ Tính Monday - Sunday tuần hiện tại
  const today = new Date()
  const day = today.getDay() // 0 = Sunday

  const diffToMonday = day === 0 ? -6 : 1 - day

  const monday = new Date(today)
  monday.setDate(today.getDate() + diffToMonday)
  monday.setHours(0, 0, 0, 0)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const startDate = formatDate(monday)
  const endDate = formatDate(sunday)

  // 3️⃣ Lấy booking trong tuần
  const { data: bookings, error: bookingError } = await supabase
    .from("bookings")
    .select("check_out_date, total_price, status")
    .in("listing_id", listingIds)
    .gte("check_out_date", startDate)
    .lte("check_out_date", endDate)

  if (bookingError) throw bookingError

  // 4️⃣ Filter booking COMPLETED or PAID
  const validBookings =
    bookings?.filter(b => b.status === "COMPLETED" || b.status === "PAID") ?? []

  // 5️⃣ Map revenue theo ngày
  const revenueMap: Record<string, number> = {}

  validBookings.forEach(b => {
    const date = b.check_out_date
    revenueMap[date] = (revenueMap[date] || 0) + Number(b.total_price)
  })

  // 6️⃣ Tạo đủ 7 ngày
  const result = []

  for (let i = 0; i < 7; i++) {
    const current = new Date(monday)
    current.setDate(monday.getDate() + i)

    const dateStr = formatDate(current)

    result.push({
      date: dateStr,
      revenue: revenueMap[dateStr] || 0,
    })
  }

  return result
}