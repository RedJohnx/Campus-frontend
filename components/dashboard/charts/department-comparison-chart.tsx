"use client"

import { useEffect, useState } from "react"
import { api, endpoints } from "@/lib/api"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DepartmentComparisonData {
  name: string
  resources: number
  cost: number
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border-0">
        <p className="font-semibold text-gray-900 mb-3">{label}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-sm text-gray-600">{entry.name}:</span>
              </div>
              <span className="font-bold" style={{ color: entry.color }}>
                {entry.name === "Resources" ? entry.value : `₹${entry.value.toLocaleString()}`}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

export default function DepartmentComparisonChart() {
  const [data, setData] = useState<DepartmentComparisonData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDepartmentData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await api.get(endpoints.dashboard.departmentAnalytics)

        if (response.data?.department_analytics && Array.isArray(response.data.department_analytics)) {
          const chartData = response.data.department_analytics.slice(0, 8).map((dept: any) => ({
            name:
              dept.department_name?.substring(0, 15) + (dept.department_name?.length > 15 ? "..." : "") || "Unknown",
            resources: dept.metrics?.total_resources || 0,
            cost: dept.metrics?.total_cost || 0,
          }))

          setData(chartData)
        } else {
          // Fallback data
          setData([{ name: "No Data", resources: 0, cost: 0 }])
        }
      } catch (err: any) {
        console.error("Department comparison chart data fetch error:", err)
        setError(err.response?.data?.error || "Failed to load department data")

        // Set fallback data
        setData([{ name: "Data Unavailable", resources: 0, cost: 0 }])
      } finally {
        setLoading(false)
      }
    }

    fetchDepartmentData()
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
    return <div className="h-full flex items-center justify-center text-gray-500">No department data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.5} />
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} stroke="#6B7280" />
        <YAxis yAxisId="left" orientation="left" stroke="#10B981" />
        <YAxis yAxisId="right" orientation="right" stroke="#3B82F6" />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar yAxisId="left" dataKey="resources" name="Resources" fill="url(#resourceGradient)" radius={[4, 4, 0, 0]} />
        <Bar yAxisId="right" dataKey="cost" name="Cost (₹)" fill="url(#costGradient)" radius={[4, 4, 0, 0]} />
        <defs>
          <linearGradient id="resourceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#34D399" stopOpacity={0.6} />
          </linearGradient>
          <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.6} />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  )
}
