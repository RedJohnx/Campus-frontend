"use client"

import { useEffect, useState } from "react"
import { api, endpoints } from "@/lib/api"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ValueData {
  name: string
  value: number
  count: number
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
            <span className="text-sm text-gray-600">Total Value:</span>
            <span className="font-bold text-green-600">₹{data.value.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Quantity:</span>
            <span className="font-medium text-blue-600">{data.payload.count} items</span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

export default function AssetValueChart() {
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
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-200 border-t-green-600 rounded-full animate-spin" />
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
    return <div className="h-full flex items-center justify-center text-gray-500">No cost data available</div>
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.5} />

          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} stroke="#6B7280" />

          <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} stroke="#6B7280" />

          <Tooltip content={<CustomTooltip />} />

          <Bar dataKey="value" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />

          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#34D399" stopOpacity={0.6} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
