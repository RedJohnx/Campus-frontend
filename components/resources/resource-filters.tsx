"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Filter, X, RefreshCw, Building2, MapPin, Smartphone, Sparkles } from "lucide-react"
import { api } from "@/lib/api"
import type { FilterOptions } from "@/lib/types"

interface ResourceFiltersProps {
  onFilterChange: (filters: any) => void
  onRefresh: () => void
}

export default function ResourceFilters({ onFilterChange, onRefresh }: ResourceFiltersProps) {
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [selectedDevice, setSelectedDevice] = useState("all")
  const [availableLocations, setAvailableLocations] = useState<string[]>([])
  const [availableDevices, setAvailableDevices] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchFilterOptions()
  }, [])

  // Handle department change
  useEffect(() => {
    if (selectedDepartment && filterOptions) {
      if (selectedDepartment === "all") {
        const allLocations = new Set<string>()
        filterOptions.departments.forEach((dept) => {
          dept.locations.forEach((loc) => allLocations.add(loc))
        })
        setAvailableLocations(Array.from(allLocations))

        const allDevices = new Set<string>()
        filterOptions.departments.forEach((dept) => {
          dept.device_types.forEach((device) => allDevices.add(device))
        })
        setAvailableDevices(Array.from(allDevices))
      } else {
        const dept = filterOptions.departments.find((d) => d.name === selectedDepartment)
        setAvailableLocations(dept?.locations || [])
        setAvailableDevices(dept?.device_types || [])
      }

      setSelectedLocation("all")
      setSelectedDevice("all")
    } else {
      setAvailableLocations([])
      setAvailableDevices([])
    }
  }, [selectedDepartment, filterOptions])

  // Handle location change
  useEffect(() => {
    if (selectedDepartment && selectedLocation && selectedLocation !== "all") {
      fetchDevicesForLocation(selectedDepartment, selectedLocation)
      setSelectedDevice("all")
    }
  }, [selectedDepartment, selectedLocation])

  // Apply filters - use useCallback to prevent infinite re-renders
  const applyFilters = useCallback(() => {
    const filters: any = {}
    if (selectedDepartment && selectedDepartment !== "all") filters.department = selectedDepartment
    if (selectedLocation && selectedLocation !== "all") filters.location = selectedLocation
    if (selectedDevice && selectedDevice !== "all") filters.device_name = selectedDevice

    onFilterChange(filters)
  }, [selectedDepartment, selectedLocation, selectedDevice, onFilterChange])

  // Apply filters when any filter changes
  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  const fetchFilterOptions = async () => {
    try {
      setLoading(true)
      const timestamp = new Date().getTime()
      const response = await api.get(`/resources/filter-options?_t=${timestamp}`)
      setFilterOptions(response.data)
    } catch (error) {
      console.error("Failed to fetch filter options:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDevicesForLocation = async (department: string, location: string) => {
    try {
      const timestamp = new Date().getTime()
      if (department === "all") {
        const response = await api.get(`/resources/filter/devices/all/${encodeURIComponent(location)}?_t=${timestamp}`)
        const devices = response.data.devices.map((d: any) => d.device_name)
        setAvailableDevices(devices)
      } else {
        const response = await api.get(
          `/resources/filter/devices/${encodeURIComponent(department)}/${encodeURIComponent(location)}?_t=${timestamp}`,
        )
        const devices = response.data.devices.map((d: any) => d.device_name)
        setAvailableDevices(devices)
      }
    } catch (error) {
      console.error("Failed to fetch devices for location:", error)
    }
  }

  const clearFilters = () => {
    setSelectedDepartment("all")
    setSelectedLocation("all")
    setSelectedDevice("all")
  }

  const refreshFilters = () => {
    fetchFilterOptions()
    onRefresh()
  }

  const hasActiveFilters = selectedDepartment !== "all" || selectedLocation !== "all" || selectedDevice !== "all"

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm relative z-10">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-lg">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Smart Filters</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Refine your search with intelligent filtering</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshFilters}
              disabled={loading}
              className="rounded-xl hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all duration-200 hover:scale-105 bg-white/80"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="rounded-xl hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200 hover:scale-105 bg-white/80"
              >
                <X className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Department Filter */}
          <div className="space-y-3 relative">
            <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-blue-500" />
              <span>Department</span>
            </label>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment} disabled={loading}>
              <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-blue-500 bg-white/80 backdrop-blur-sm">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent
                className="z-[100] max-h-[300px] overflow-y-auto bg-white/95 backdrop-blur-md border-0 shadow-2xl rounded-xl"
                position="popper"
                sideOffset={5}
              >
                <SelectItem value="all">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-blue-500" />
                    <span>All Departments</span>
                  </div>
                </SelectItem>
                {filterOptions?.departments.map((dept) => (
                  <SelectItem key={dept.name} value={dept.name}>
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate max-w-[200px]">{dept.name}</span>
                      <Badge variant="secondary" className="ml-2 text-xs bg-blue-100 text-blue-700 shrink-0">
                        {dept.stats.total_resources}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location Filter */}
          <div className="space-y-3 relative">
            <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-green-500" />
              <span>Location</span>
            </label>
            <Select value={selectedLocation} onValueChange={setSelectedLocation} disabled={!filterOptions || loading}>
              <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-green-500 bg-white/80 backdrop-blur-sm">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent
                className="z-[100] max-h-[300px] overflow-y-auto bg-white/95 backdrop-blur-md border-0 shadow-2xl rounded-xl"
                position="popper"
                sideOffset={5}
              >
                <SelectItem value="all">All Locations</SelectItem>
                {availableLocations.map((location) => (
                  <SelectItem key={location} value={location}>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3 h-3 text-green-500" />
                      <span className="truncate max-w-[200px]">{location}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Device Type Filter */}
          <div className="space-y-3 relative">
            <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-purple-500" />
              <span>Device Type</span>
            </label>
            <Select value={selectedDevice} onValueChange={setSelectedDevice} disabled={!filterOptions || loading}>
              <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-purple-500 bg-white/80 backdrop-blur-sm">
                <SelectValue placeholder="Select device" />
              </SelectTrigger>
              <SelectContent
                className="z-[100] max-h-[300px] overflow-y-auto bg-white/95 backdrop-blur-md border-0 shadow-2xl rounded-xl"
                position="popper"
                sideOffset={5}
              >
                <SelectItem value="all">All Devices</SelectItem>
                {availableDevices.map((device) => (
                  <SelectItem key={device} value={device}>
                    <div className="flex items-center space-x-2">
                      <Smartphone className="w-3 h-3 text-purple-500" />
                      <span className="truncate max-w-[200px]">{device}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">Active Filters</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg"
              >
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedDepartment !== "all" && (
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-full">
                  <Building2 className="w-3 h-3 mr-1" />
                  <span className="truncate max-w-[100px]">{selectedDepartment}</span>
                  <button
                    onClick={() => setSelectedDepartment("all")}
                    className="ml-2 hover:bg-blue-300 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {selectedLocation !== "all" && (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded-full">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span className="truncate max-w-[100px]">{selectedLocation}</span>
                  <button
                    onClick={() => setSelectedLocation("all")}
                    className="ml-2 hover:bg-green-300 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {selectedDevice !== "all" && (
                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1 rounded-full">
                  <Smartphone className="w-3 h-3 mr-1" />
                  <span className="truncate max-w-[100px]">{selectedDevice}</span>
                  <button
                    onClick={() => setSelectedDevice("all")}
                    className="ml-2 hover:bg-purple-300 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
