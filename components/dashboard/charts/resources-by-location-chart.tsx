"use client"

import { useEffect, useState } from "react"
import { api, endpoints } from "@/lib/api"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface LocationData {
  name: string
  resources: number
  department: string
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]
    return (
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border-0">
        <p className="font-semibold text-gray-900 mb-3">{label}</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Resources:</span>
            <span className="font-bold text-purple-600">{data.value}</span>
          </div>
          {data.payload.department && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Department:</span>
              <span className="font-medium text-blue-600">{data.payload.department}</span>
            </div>
          )}
        </div>
      </div>
    )
  }
  return null
}

export default function ResourcesByLocationChart() {
  const [data, setData] = useState<LocationData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await api.get(endpoints.dashboard.utilizationMetrics)

        if (
          response.data?.utilization_metrics?.location_density &&
          Array.isArray(response.data.utilization_metrics.location_density)
        ) {
          const chartData = response.data.utilization_metrics.location_density.slice(0, 10).map((item: any) => ({
            name: item._id?.substring(0, 15) + (item._id?.length > 15 ? "..." : "") || "Unknown",
            resources: item.resource_count || 0,
            department: item.department || "Unknown",
          }))

          setData(chartData)
        } else {
          // Fallback data
          setData([{ name: "No Data", resources: 0, department: "Unknown" }])
        }
      } catch (err: any) {
        console.error("Location chart data fetch error:", err)
        setError(err.response?.data?.error || "Failed to load location data")

        // Set fallback data
        setData([{ name: "Data Unavailable", resources: 0, department: "Unknown" }])
      } finally {
        setLoading(false)
      }
    }

    fetchLocationData()
  }, [])

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
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
    return <div className="h-full flex items-center justify-center text-gray-500">No location data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 60, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.5} />
        <XAxis type="number" stroke="#6B7280" />
        <YAxis dataKey="name" type="category" width={100} stroke="#6B7280" />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="resources" fill="url(#locationGradient)" radius={[0, 4, 4, 0]} />
        <defs>
          <linearGradient id="locationGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#EC4899" stopOpacity={0.6} />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  )
}
