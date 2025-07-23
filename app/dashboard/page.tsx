import { Suspense } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import DashboardOverview from "@/components/dashboard/dashboard-overview"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function DashboardPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Hero section skeleton */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8">
        <div className="space-y-3">
          <div className="h-8 bg-white/20 rounded-lg w-80 animate-pulse" />
          <div className="h-5 bg-white/15 rounded-lg w-96 animate-pulse" />
        </div>
      </div>
      
      {/* Dashboard content skeleton */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                <div className="h-8 bg-gray-200 rounded w-24 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
              </div>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-40 animate-pulse" />
              <div className="h-64 bg-gray-100 rounded animate-pulse" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-40 animate-pulse" />
              <div className="h-64 bg-gray-100 rounded animate-pulse" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">👋 Welcome back, Admin!</h1>
          <p className="text-blue-100">Here's what's happening with your campus assets today.</p>
        </div>

        <Suspense fallback={<DashboardPageSkeleton />}>
          <DashboardOverview />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}