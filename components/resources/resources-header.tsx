"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Search, Package, Download, TrendingUp, Building2, Sparkles } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/lib/api"
import ResourceFormModal from "./resource-form-modal"
import { useRouter } from "next/navigation"

interface ResourcesHeaderProps {
  onSearch: (query: string) => void
}

export default function ResourcesHeader({ onSearch }: ResourcesHeaderProps) {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [stats, setStats] = useState({
    totalAssets: 0,
    totalValue: 0,
    totalDepartments: 0,
  })
  const [showAddModal, setShowAddModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      const response = await api.get("/dashboard/overview")
      const overview = response.data.overview
      setStats({
        totalAssets: overview.total_resources || 0,
        totalValue: overview.total_value || 0,
        totalDepartments: overview.total_departments || 0,
      })
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery)
  }

  const handleExport = () => {
    router.push("/file-management?tab=export")
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Hero Header Card */}
      <Card className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white border-0 shadow-2xl overflow-hidden relative">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16"></div>
        <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white/40 rounded-full animate-pulse delay-75"></div>

        <CardContent className="p-8 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                  <Package className="w-8 h-8" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Resource Management</h1>
                <p className="text-green-100 mt-1">Comprehensive asset tracking and management system</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-6">
              {[
                { label: "Total Assets", value: stats.totalAssets, icon: Package, color: "from-blue-400 to-blue-500" },
                {
                  label: "Total Value",
                  value: formatCurrency(stats.totalValue),
                  icon: TrendingUp,
                  color: "from-green-400 to-green-500",
                },
                {
                  label: "Departments",
                  value: stats.totalDepartments,
                  icon: Building2,
                  color: "from-purple-400 to-purple-500",
                },
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className={`text-center bg-white/20 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/30 transition-all duration-300 hover:scale-105 animate-fade-in-up stagger-${index + 1}`}
                >
                  <div className="flex items-center justify-center mb-2">
                    <div className={`bg-gradient-to-r ${stat.color} p-2 rounded-lg`}>
                      <stat.icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold">
                    {isLoading ? (
                      <div className="w-12 h-6 bg-white/20 rounded animate-pulse mx-auto"></div>
                    ) : (
                      stat.value
                    )}
                  </div>
                  <div className="text-green-100 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature badges */}
          <div className="flex space-x-4 mt-6">
            {[
              { icon: "📊", text: "Advanced Filtering" },
              { icon: "⚡", text: "Real-time Updates" },
              { icon: "🎯", text: "Smart Management" },
              { icon: "🔒", text: "Secure Access" },
            ].map((feature, index) => (
              <div
                key={feature.text}
                className={`bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl hover:bg-white/30 transition-all duration-200 hover:scale-105 animate-fade-in-up stagger-${index + 1}`}
              >
                <span className="text-sm flex items-center space-x-2">
                  <span>{feature.icon}</span>
                  <span>{feature.text}</span>
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search and Actions Bar */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* Title Section */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold gradient-text-primary">Resources Database</h2>
              <p className="text-gray-600 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span>Manage your campus laboratory equipment and resources</span>
              </p>
            </div>

            {/* Actions Section */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              {/* Search Form */}
              <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 lg:flex-initial">
                <div className="relative flex-1 lg:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search resources, departments, locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl bg-white/80 backdrop-blur-sm"
                  />
                </div>
                <Button
                  type="submit"
                  variant="outline"
                  className="h-12 px-6 rounded-xl border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all duration-200 hover:scale-105 bg-white/80 backdrop-blur-sm"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </form>

              {/* Action Buttons */}
              <Button
                variant="outline"
                onClick={handleExport}
                className="h-12 px-6 rounded-xl border-gray-200 hover:bg-green-50 hover:border-green-300 hover:text-green-600 transition-all duration-200 hover:scale-105 bg-white/80 backdrop-blur-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>

              {user?.role === "admin" && (
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Resource
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Resource Modal */}
      <ResourceFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          fetchStats()
          window.location.reload()
        }}
      />
    </div>
  )
}
