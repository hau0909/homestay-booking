
"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { getRevenueInWeek } from "@/src/services/host/getRevenueInWeek"
import { getRevenueInMonth } from "@/src/services/host/getRevenueInMonth"
import { getRevenueInYear } from "@/src/services/host/getRevenueInYear"



const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function RevenueChart({ hostId }: { hostId: string }) {
  const [range, setRange] = React.useState<"week" | "month" | "year">("week")
  const [data, setData] = React.useState<
    { date: string; revenue: number }[]
  >([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true)

      let result: { date: string; revenue: number }[] = []

      if (range === "week") {
        result = await getRevenueInWeek(hostId)
      } else if (range === "month") {
        result = await getRevenueInMonth(hostId)
      } else {
        result = await getRevenueInYear(hostId)
      }

      setData(result)
      setLoading(false)
    }

    fetchData()
  }, [range, hostId])

  const totalRevenue = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.revenue, 0)
  }, [data])

  return (
    <>
      <CardHeader className="border-b p-0">
  <div className="flex items-center px-6 py-4">
    
    <div>
      <CardTitle>Revenue Overview</CardTitle>
      <CardDescription>
        Total Revenue: ${totalRevenue.toLocaleString()}
      </CardDescription>
    </div>

    {/* ml-auto đẩy qua phải */}
    <div className="flex gap-2 ml-auto">
      {["week", "month", "year"].map((item) => (
        <button
          key={item}
          onClick={() =>
            setRange(item as "week" | "month" | "year")
          }
          className={`px-4 py-2 rounded-md text-sm ${
            range === item
              ? "bg-black text-white"
              : "bg-gray-100"
          }`}
        >
          {item.toUpperCase()}
        </button>
      ))}
    </div>

  </div>
</CardHeader>

      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="h-[300px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={data}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={20}
              tickFormatter={(value) => {
                const date = new Date(value)
                if (range === "year") {
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                  })
                }
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="revenue"
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString()
                  }
                />
              }
            />
            <Bar dataKey="revenue" fill="var(--chart-1)"  />  
        {/* barSize={14} */}
          </BarChart>
        </ChartContainer>

        {loading && (
          <div className="text-center text-muted-foreground mt-4">
            Loading...
          </div>
        )}
      </CardContent>
    </>
  )
}