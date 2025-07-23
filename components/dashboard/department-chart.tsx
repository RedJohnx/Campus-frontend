"use client"

import { useEffect, useState } from "react"
import { api, endpoints } from "@/lib/api"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DepartmentData {
  name: string
  value: number
  color: string
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF7C7C"]

export default function DepartmentChart() {
  const [data, setData] = useState<DepartmentData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDepartmentData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await api.get(endpoints.dashboard.departmentAnalytics)

        if (response.data?.department_analytics && Array.isArray(response.data.department_analytics)) {
          const chartData = response.data.department_analytics.slice(0, 8).map((dept: any, index: number) => ({
            name: dept.department_name || "Unknown",
            value: dept.metrics?.total_resources || 0,
            color: COLORS[index % COLORS.length],
          }))

          setData(chartData)
        } else {
          // Fallback data
          setData([{ name: "No Data", value: 1, color: "#E5E7EB" }])
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
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">No department data available</div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [value, "Resources"]}
          labelFormatter={(label) => `Department: ${label}`}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
