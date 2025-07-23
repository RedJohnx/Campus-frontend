"use client"

import { useEffect, useState } from "react"
import { api, endpoints } from "@/lib/api"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ValueData {
  name: string
  value: number
  count: number
}

export default function ValueChart() {
  const [data, setData] = useState<ValueData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchValueData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await api.get(endpoints.dashboard.costAnalysis)

        if (
          response.data?.cost_analysis?.device_type_costs &&
          Array.isArray(response.data.cost_analysis.device_type_costs)
        ) {
          const chartData = response.data.cost_analysis.device_type_costs.slice(0, 10).map((item: any) => ({
            name: item._id?.substring(0, 15) + (item._id?.length > 15 ? "..." : "") || "Unknown",
            value: item.total_cost || 0,
            count: item.total_quantity || 0,
          }))

          setData(chartData)
        } else {
          // Fallback data
          setData([{ name: "No Data", value: 0, count: 0 }])
        }
      } catch (err: any) {
        console.error("Value chart data fetch error:", err)
        setError(err.response?.data?.error || "Failed to load cost data")

        // Set fallback data
        setData([{ name: "Data Unavailable", value: 0, count: 0 }])
      } finally {
        setLoading(false)
      }
    }

    fetchValueData()
  }, [])

  if (loading) {
    return <Skeleton className="h-64 w-full" />
  }

  if (error) {
    return (
      <Alert>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-muted-foreground">No cost data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
        <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
        <Tooltip
          formatter={(value: number) => [`₹${value.toLocaleString()}`, "Total Value"]}
          labelFormatter={(label) => `Device: ${label}`}
        />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  )
}
