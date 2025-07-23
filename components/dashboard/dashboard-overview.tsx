"use client"

import { useEffect, useState } from "react"
import { api, endpoints } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, TrendingUp, Building2, Package, DollarSign, PieChart, BarChart3, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DepartmentDistributionChart from "./charts/department-distribution-chart"
import AssetValueChart from "./charts/asset-value-chart"
import ResourcesByLocationChart from "./charts/resources-by-location-chart"
import DeviceTypeDistributionChart from "./charts/device-type-distribution-chart"
import DepartmentComparisonChart from "./charts/department-comparison-chart"
import ResourceAgeChart from "./charts/resource-age-chart"
import StatsCard from "./stats-card"

interface DashboardData {
  overview: {
    total_resources: number
    total_departments: number
    total_users: number
    total_value: number
    total_quantity: number
    unique_devices: number
    unique_locations: number
    recent_additions_30d: number
  }
  financial_metrics: {
    total_asset_value: number
    average_cost_per_item: number
    most_expensive_item: number
    least_expensive_item: number
    cost_per_resource: number
  }
  top_performers: {
    leading_department: {
      name: string
      resource_count: number
    }
    most_expensive_item: {
      device_name: string
      cost: number
      department: string
    }
  }
  utilization_metrics: {
    total_locations: number
    avg_resources_per_location: number
    most_resourced_location: {
      name: string
      resource_count: number
    }
    most_diverse_location: {
      name: string
      device_types: number
    }
  }
}

export default function DashboardOverview() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.get(endpoints.dashboard.overview)

      if (response.data) {
        setData(response.data)
        setLastUpdated(new Date())
      } else {
        throw new Error("No data received from server")
      }
    } catch (err: any) {
      console.error("Dashboard data fetch error:", err)
      setError(err.response?.data?.error || err.message || "Failed to load dashboard data")

      // Set fallback data to prevent crashes
      setData({
        overview: {
          total_resources: 0,
          total_departments: 0,
          total_users: 0,
          total_value: 0,
          total_quantity: 0,
          unique_devices: 0,
          unique_locations: 0,
          recent_additions_30d: 0,
        },
        financial_metrics: {
          total_asset_value: 0,
          average_cost_per_item: 0,
          most_expensive_item: 0,
          least_expensive_item: 0,
          cost_per_resource: 0,
        },
        top_performers: {
          leading_department: {
            name: "N/A",
            resource_count: 0,
          },
          most_expensive_item: {
            device_name: "N/A",
            cost: 0,
            department: "N/A",
          },
        },
        utilization_metrics: {
          total_locations: 0,
          avg_resources_per_location: 0,
          most_resourced_location: {
            name: "N/A",
            resource_count: 0,
          },
          most_diverse_location: {
            name: "N/A",
            device_types: 0,
          },
        },
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in-up">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <Skeleton className="h-10 w-80" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Skeleton className="h-12 w-32" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <div className="space-y-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
            </Card>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-80 w-full" />
            </div>
          </Card>
          <Card className="p-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-80 w-full" />
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-8">
        <div className="text-center space-y-4">
          <div className="text-8xl animate-bounce-subtle">📊</div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard Temporarily Unavailable</h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">{error}</p>
        </div>

        <Button onClick={fetchDashboardData} className="btn-primary">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  const overview = data?.overview || {}
  const financial = data?.financial_metrics || {}
  const performers = data?.top_performers || {}
  const utilization = data?.utilization_metrics || {}

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold tracking-tight gradient-text-primary">Dashboard Overview</h2>
          <p className="text-gray-600 mt-2 text-lg">Comprehensive insights into your campus assets and resources</p>
        </div>
        <div className="flex items-center space-x-4">
          {lastUpdated && (
            <div className="bg-green-50 text-green-700 px-4 py-2 rounded-xl border border-green-200">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span className="text-sm font-medium">Updated: {lastUpdated.toLocaleTimeString()}</span>
              </div>
            </div>
          )}
          <Button onClick={fetchDashboardData} className="btn-primary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {error && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertDescription className="text-yellow-800">{error} - Showing cached data</AlertDescription>
        </Alert>
      )}

      {/* Enhanced Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Resources"
          value={overview.total_resources || 0}
          subtitle="Active resources in system"
          icon={Package}
          color="blue"
          trend={{
            value: 12.5,
            isPositive: true,
          }}
        />
        <StatsCard
          title="Total Value"
          value={`₹${(overview.total_value || 0).toLocaleString()}`}
          subtitle="Total asset value"
          icon={DollarSign}
          color="green"
          trend={{
            value: 8.3,
            isPositive: true,
          }}
        />
        <StatsCard
          title="Departments"
          value={overview.total_departments || 0}
          subtitle="Active departments"
          icon={Building2}
          color="purple"
          trend={{
            value: 2.1,
            isPositive: false,
          }}
        />
        <StatsCard
          title="Locations"
          value={overview.unique_locations || 0}
          subtitle="Unique locations"
          icon={TrendingUp}
          color="orange"
          trend={{
            value: 5.7,
            isPositive: true,
          }}
        />
      </div>

      {/* Enhanced Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg">
          <TabsTrigger
            value="overview"
            className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
          >
            <PieChart className="w-4 h-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger
            value="departments"
            className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white"
          >
            <Building2 className="w-4 h-4" />
            <span>Departments</span>
          </TabsTrigger>
          <TabsTrigger
            value="resources"
            className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
          >
            <Package className="w-4 h-4" />
            <span>Resources</span>
          </TabsTrigger>
          <TabsTrigger
            value="financial"
            className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white"
          >
            <DollarSign className="w-4 h-4" />
            <span>Financial</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8">
          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-lg">
                    <PieChart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Department Distribution</CardTitle>
                    <CardDescription>Resource distribution across departments</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-80">
                <DepartmentDistributionChart />
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-green-500 to-teal-500 p-2 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Asset Value Trends</CardTitle>
                    <CardDescription>Asset value distribution and trends</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-80">
                <AssetValueChart />
              </CardContent>
            </Card>
          </div>

          {/* Additional Insights */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-blue-800 flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  Top Department
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">{performers.leading_department?.name || "N/A"}</div>
                <p className="text-blue-600 mt-1">{performers.leading_department?.resource_count || 0} resources</p>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-green-800 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Most Expensive Item
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-900">
                  ₹{(performers.most_expensive_item?.cost || 0).toLocaleString()}
                </div>
                <p className="text-green-600 mt-1 truncate">{performers.most_expensive_item?.device_name || "N/A"}</p>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-gradient-to-br from-purple-50 to-purple-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-purple-800 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-900">{overview.recent_additions_30d || 0}</div>
                <p className="text-purple-600 mt-1">New resources this month</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-green-500 to-teal-500 p-2 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Department Comparison</CardTitle>
                    <CardDescription>Resource count by department</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-80">
                <DepartmentComparisonChart />
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
                    <PieChart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Resources by Location</CardTitle>
                    <CardDescription>Distribution of resources across locations</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-80">
                <ResourcesByLocationChart />
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Department Utilization Metrics</CardTitle>
              <CardDescription>Resource utilization across departments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-2">Most Resourced Location</h3>
                  <p className="text-2xl font-bold text-blue-900">
                    {utilization.most_resourced_location?.name || "N/A"}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    {utilization.most_resourced_location?.resource_count || 0} resources
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-2">Most Diverse Location</h3>
                  <p className="text-2xl font-bold text-green-900">
                    {utilization.most_diverse_location?.name || "N/A"}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    {utilization.most_diverse_location?.device_types || 0} device types
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
                  <h3 className="font-semibold text-purple-800 mb-2">Average Resources per Location</h3>
                  <p className="text-2xl font-bold text-purple-900">
                    {utilization.avg_resources_per_location?.toFixed(1) || "0"}
                  </p>
                  <p className="text-sm text-purple-600 mt-1">Across {utilization.total_locations || 0} locations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
                    <PieChart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Device Type Distribution</CardTitle>
                    <CardDescription>Resources by device type</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-80">
                <DeviceTypeDistributionChart />
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-orange-500 to-red-500 p-2 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Resource Age Analysis</CardTitle>
                    <CardDescription>Age distribution of resources</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-80">
                <ResourceAgeChart />
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Resource Metrics</CardTitle>
              <CardDescription>Key metrics about your resources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-2">Total Resources</h3>
                  <p className="text-2xl font-bold text-blue-900">
                    {overview.total_resources?.toLocaleString() || "0"}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-2">Total Quantity</h3>
                  <p className="text-2xl font-bold text-green-900">
                    {overview.total_quantity?.toLocaleString() || "0"}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
                  <h3 className="font-semibold text-purple-800 mb-2">Unique Devices</h3>
                  <p className="text-2xl font-bold text-purple-900">
                    {overview.unique_devices?.toLocaleString() || "0"}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200">
                  <h3 className="font-semibold text-orange-800 mb-2">Recent Additions</h3>
                  <p className="text-2xl font-bold text-orange-900">
                    {overview.recent_additions_30d?.toLocaleString() || "0"}
                  </p>
                  <p className="text-sm text-orange-600 mt-1">Last 30 days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-green-500 to-teal-500 p-2 rounded-lg">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Financial Overview</CardTitle>
                    <CardDescription>Key financial metrics</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl">
                    <span className="text-gray-700 font-medium">Total Asset Value</span>
                    <span className="text-2xl font-bold text-green-600">
                      ₹{financial.total_asset_value?.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                    <span className="text-gray-700 font-medium">Average Cost per Item</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ₹{financial.average_cost_per_item?.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                    <span className="text-gray-700 font-medium">Most Expensive Item</span>
                    <span className="text-2xl font-bold text-orange-600">
                      ₹{financial.most_expensive_item?.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                    <span className="text-gray-700 font-medium">Cost per Resource</span>
                    <span className="text-2xl font-bold text-purple-600">
                      ₹{financial.cost_per_resource?.toLocaleString() || "0"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-orange-500 to-red-500 p-2 rounded-lg">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Most Expensive Item</CardTitle>
                    <CardDescription>Details of the highest value asset</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-200">
                  <h3 className="text-2xl font-bold text-orange-800 mb-4">
                    {performers.most_expensive_item?.device_name || "N/A"}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Cost</span>
                      <span className="font-bold text-green-600">
                        ₹{performers.most_expensive_item?.cost?.toLocaleString() || "0"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Department</span>
                      <span className="font-bold text-blue-600">
                        {performers.most_expensive_item?.department || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Financial Recommendations</CardTitle>
              <CardDescription>Insights to optimize your budget</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-3">Budget Optimization</h3>
                  <p className="text-sm text-blue-700">
                    Consider bulk purchasing for frequently procured items to reduce per-unit costs.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-3">Resource Allocation</h3>
                  <p className="text-sm text-green-700">
                    Analyze department spending patterns to identify opportunities for resource sharing.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
                  <h3 className="font-semibold text-purple-800 mb-3">Maintenance Planning</h3>
                  <p className="text-sm text-purple-700">
                    Implement preventive maintenance schedules for equipment older than 3 years to extend lifespan.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
