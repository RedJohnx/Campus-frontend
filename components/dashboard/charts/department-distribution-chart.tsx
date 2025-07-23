"use client"

import { useEffect, useState } from "react"
import { api, endpoints } from "@/lib/api"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DepartmentData {
  name: string
  value: number
  color: string
}

// Modern color palette
const COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#EC4899", // Pink
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
          <span className="text-sm text-gray-600">{data.value} resources</span>
        </div>
      </div>
    )
  }
  return null
}

export default function DepartmentDistributionChart() {
  const [data, setData] = useState<DepartmentData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDepartmentData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Try the dedicated department analytics endpoint first
        const response = await api.get(endpoints.dashboard.departmentAnalytics)

        if (response.data?.department_analytics && Array.isArray(response.data.department_analytics)) {
          const chartData = response.data.department_analytics.slice(0, 8).map((dept: any, index: number) => ({
            name: dept.department_name || "Unknown",
            value: dept.metrics?.total_resources || 0,
            color: COLORS[index % COLORS.length],
          }))

          setData(chartData)
        } else {
          // Fallback: try the department distribution endpoint
          try {
            const fallbackResponse = await api.get("/api/dashboard/department-distribution")
            if (fallbackResponse.data?.pie_chart?.data) {
              const chartData = fallbackResponse.data.pie_chart.labels.map((label: string, index: number) => ({
                name: label,
                value: fallbackResponse.data.pie_chart.data[index],
                color: COLORS[index % COLORS.length],
              }))
              setData(chartData)
            } else {
              setData([{ name: "No Data", value: 1, color: "#E5E7EB" }])
            }
          } catch (fallbackErr) {
            console.error("Fallback endpoint also failed:", fallbackErr)
            setData([{ name: "No Data", value: 1, color: "#E5E7EB" }])
          }
        }
      } catch (err: any) {
        console.error("Department chart data fetch error:", err)
        setError(err.response?.data?.error || "Failed to load department data")

        // Set fallback data
        setData([{ name: "Data Unavailable", value: 1, color: "#EF4444" }])
      } finally {
        setLoading(false)
      }
    }

    fetchDepartmentData()
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
    return <div className="h-full flex items-center justify-center text-gray-500">No department data available</div>
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
