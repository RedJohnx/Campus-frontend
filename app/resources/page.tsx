"use client"

import { useState, useCallback, useEffect } from "react"
import { Suspense } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import ResourcesTable from "@/components/resources/resources-table"
import ResourcesHeader from "@/components/resources/resources-header"
import ResourceFilters from "@/components/resources/resource-filters"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { ResourceFilters as ResourceFiltersType } from "@/lib/types"

function ResourcesSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <Card className="p-8 bg-gradient-to-r from-blue-100 to-purple-100">
        <div className="flex justify-between items-center">
          <div className="space-y-3">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center space-y-2">
                <Skeleton className="h-8 w-16 mx-auto" />
                <Skeleton className="h-3 w-20 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Filters Skeleton */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Table Skeleton */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

export default function ResourcesPage() {
  return (
    <DashboardLayout>
      <ResourcesPageContent />
    </DashboardLayout>
  )
}

function ResourcesPageContent() {
  const [filters, setFilters] = useState<ResourceFiltersType>({})
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")

  // Use useCallback to prevent infinite re-renders
  const handleFilterChange = useCallback((newFilters: ResourceFiltersType) => {
    setFilters(newFilters)
  }, [])

  const handleRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  // Combine search with filters
  useEffect(() => {
    if (searchQuery) {
      setFilters((prev) => ({ ...prev, search: searchQuery }))
    } else {
      // Remove search from filters if empty
      const { search, ...restFilters } = filters
      setFilters(restFilters)
    }
  }, [searchQuery])

  return (
    <div className="space-y-6 animate-fade-in-up">
      <ResourcesHeader onSearch={handleSearch} />

      <ResourceFilters onFilterChange={handleFilterChange} onRefresh={handleRefresh} />

      <Suspense fallback={<ResourcesSkeleton />}>
        <ResourcesTable filters={filters} refreshTrigger={refreshTrigger} />
      </Suspense>
    </div>
  )
}
