"use client"

import { useEffect, useState } from "react"
import { api, endpoints } from "@/lib/api"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DeviceData {
  name: string
  value: number
  color: string
}

// Modern color palette
const COLORS = [
  "#6366F1", // Indigo
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#F59E0B", // Amber
  "#10B981", // Emerald
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#EF4444", // Red
]

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]
    return (
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border-0">
        <p className="font-semibold text-gray-900 mb-2">{data.payload.name}</p>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.payload.color }} />
          <span className="text-sm text-gray-600">{data.value} devices</span>
        </div>
      </div>
    )
  }
  return null
}

export default function DeviceTypeDistributionChart() {
  const [data, setData] = useState<DeviceData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDeviceData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await api.get(endpoints.dashboard.utilizationMetrics)

        if (
          response.data?.utilization_metrics?.device_utilization &&
          Array.isArray(response.data.utilization_metrics.device_utilization)
        ) {
          const chartData = response.data.utilization_metrics.device_utilization
            .slice(0, 8)
            .map((item: any, index: number) => ({
              name: item._id?.substring(0, 15) + (item._id?.length > 15 ? "..." : "") || "Unknown",
              value: item.total_quantity || 0,
              color: COLORS[index % COLORS.length],
            }))

          setData(chartData)
        } else {
          // Fallback data
          setData([{ name: "No Data", value: 1, color: "#E5E7EB" }])
        }
      } catch (err: any) {
        console.error("Device chart data fetch error:", err)
        setError(err.response?.data?.error || "Failed to load device data")

        // Set fallback data
        setData([{ name: "Data Unavailable", value: 1, color: "#EF4444" }])
      } finally {
        setLoading(false)
      }
    }

    fetchDeviceData()
  }, [])

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="bg-red-50 border-red-200">
        <AlertDescription className="text-red-700">{error}</AlertDescription>
      </Alert>
    )
  }

  if (!data || data.length === 0) {
    return <div className="h-full flex items-center justify-center text-gray-500">No device data available</div>
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            innerRadius={30}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
