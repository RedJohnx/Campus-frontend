"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Download,
  FileText,
  FileSpreadsheet,
  File,
  Filter,
  Calendar,
  Building2,
  RefreshCw,
  Sparkles,
  Zap,
} from "lucide-react"
import { api } from "@/lib/api"
import type { FilterOptions } from "@/lib/types"

export default function ExportSection() {
  const [exportFormat, setExportFormat] = useState("excel")
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [selectedDevice, setSelectedDevice] = useState("all")
  const [availableLocations, setAvailableLocations] = useState<string[]>([])
  const [availableDevices, setAvailableDevices] = useState<string[]>([])
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [includeStats, setIncludeStats] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  const exportFormats = [
    {
      value: "csv",
      label: "CSV",
      icon: FileText,
      description: "Comma-separated values",
      color: "from-green-500 to-emerald-500",
    },
    {
      value: "excel",
      label: "Excel",
      icon: FileSpreadsheet,
      description: "Microsoft Excel format",
      color: "from-blue-500 to-indigo-500",
    },
    {
      value: "pdf",
      label: "PDF",
      icon: File,
      description: "Portable document format",
      color: "from-red-500 to-pink-500",
    },
    {
      value: "json",
      label: "JSON",
      icon: FileText,
      description: "JavaScript object notation",
      color: "from-purple-500 to-violet-500",
    },
  ]

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

  const fetchFilterOptions = async () => {
    try {
      setLoading(true)
      const response = await api.get("/resources/filter-options")
      setFilterOptions(response.data)
    } catch (error) {
      console.error("Failed to fetch filter options:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDevicesForLocation = async (department: string, location: string) => {
    try {
      if (department === "all") {
        const response = await api.get(`/resources/filter/devices/all/${encodeURIComponent(location)}`)
        const devices = response.data.devices.map((d: any) => d.device_name)
        setAvailableDevices(devices)
      } else {
        const response = await api.get(
          `/resources/filter/devices/${encodeURIComponent(department)}/${encodeURIComponent(location)}`,
        )
        const devices = response.data.devices.map((d: any) => d.device_name)
        setAvailableDevices(devices)
      }
    } catch (error) {
      console.error("Failed to fetch devices for location:", error)
    }
  }

  const refreshFilters = () => {
    fetchFilterOptions()
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      setExportProgress(0)

      const params = new URLSearchParams()
      if (selectedDepartment !== "all") params.append("department", selectedDepartment)
      if (selectedLocation !== "all") params.append("location", selectedLocation)
      if (selectedDevice !== "all") params.append("device_name", selectedDevice)
      if (dateFrom) params.append("date_from", dateFrom)
      if (dateTo) params.append("date_to", dateTo)
      if (includeStats) params.append("include_stats", "true")

      const endpoint = `/export/${exportFormat}${params.toString() ? `?${params.toString()}` : ""}`

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 15
        })
      }, 200)

      const response = await api.get(endpoint, {
        responseType: "blob",
      })

      clearInterval(progressInterval)
      setExportProgress(100)

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url

      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
      const extension = exportFormat === "excel" ? "xlsx" : exportFormat
      link.setAttribute("download", `campus_assets_${timestamp}.${extension}`)

      document.body.appendChild(link)
      link.click()
      link.remove()

      setTimeout(() => {
        setExportProgress(0)
      }, 2000)
    } catch (error) {
      console.error("Export failed:", error)
      setExportProgress(0)
    } finally {
      setExporting(false)
    }
  }

  const clearFilters = () => {
    setSelectedDepartment("all")
    setSelectedLocation("all")
    setSelectedDevice("all")
    setDateFrom("")
    setDateTo("")
  }

  const hasActiveFilters =
    selectedDepartment !== "all" || selectedLocation !== "all" || selectedDevice !== "all" || dateFrom || dateTo

  return (
    <div className="space-y-6">
      {/* Export Format Selection */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span>Export Format</span>
          </CardTitle>
          <p className="text-gray-600">Choose your preferred export format</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {exportFormats.map((format) => (
              <div
                key={format.value}
                className={`border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  exportFormat === format.value
                    ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                }`}
                onClick={() => setExportFormat(format.value)}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      exportFormat === format.value ? `bg-gradient-to-br ${format.color}` : "bg-gray-100"
                    }`}
                  >
                    <format.icon
                      className={`w-6 h-6 ${exportFormat === format.value ? "text-white" : "text-gray-400"}`}
                    />
                  </div>
                  <div className="text-center">
                    <div
                      className={`font-semibold ${exportFormat === format.value ? "text-blue-700" : "text-gray-900"}`}
                    >
                      {format.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{format.description}</div>
                  </div>
                  {exportFormat === format.value && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Filters */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-green-500 to-teal-500 p-2 rounded-lg">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>Export Filters</CardTitle>
                <p className="text-gray-600 text-sm mt-1">Apply filters to customize your export</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshFilters}
                disabled={loading}
                className="rounded-xl hover:bg-gray-50 transition-colors duration-200 bg-transparent"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors duration-200 bg-transparent"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department" className="text-sm font-semibold text-gray-700">
                Department
              </Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment} disabled={loading}>
                <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-blue-500">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-blue-500" />
                      <span>All Departments</span>
                    </div>
                  </SelectItem>
                  {filterOptions?.departments.map((dept) => (
                    <SelectItem key={dept.name} value={dept.name}>
                      <div className="flex items-center justify-between w-full">
                        <span>{dept.name}</span>
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {dept.stats.total_resources}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-semibold text-gray-700">
                Location
              </Label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation} disabled={!filterOptions || loading}>
                <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-blue-500">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {availableLocations.map((location) => (
                    <SelectItem key={location} value={location}>
                      📍 {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="device" className="text-sm font-semibold text-gray-700">
                Device Type
              </Label>
              <Select value={selectedDevice} onValueChange={setSelectedDevice} disabled={!filterOptions || loading}>
                <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-blue-500">
                  <SelectValue placeholder="Select device" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Devices</SelectItem>
                  {availableDevices.map((device) => (
                    <SelectItem key={device} value={device}>
                      📱 {device}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFrom" className="text-sm font-semibold text-gray-700">
                Date From
              </Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-12 rounded-xl border-gray-200 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTo" className="text-sm font-semibold text-gray-700">
                Date To
              </Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-12 rounded-xl border-gray-200 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
            <Checkbox
              id="includeStats"
              checked={includeStats}
              onCheckedChange={(checked) => setIncludeStats(checked as boolean)}
              className="rounded-md"
            />
            <Label htmlFor="includeStats" className="text-sm font-medium cursor-pointer">
              Include summary statistics and analytics
            </Label>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
              <span className="text-sm font-semibold text-gray-700 flex items-center space-x-1">
                <Sparkles className="w-4 h-4" />
                <span>Active filters:</span>
              </span>
              {selectedDepartment !== "all" && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                  <Building2 className="w-3 h-3 mr-1" />
                  {selectedDepartment}
                </Badge>
              )}
              {selectedLocation !== "all" && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">
                  📍 {selectedLocation}
                </Badge>
              )}
              {selectedDevice !== "all" && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                  📱 {selectedDevice}
                </Badge>
              )}
              {dateFrom && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200">
                  <Calendar className="w-3 h-3 mr-1" />
                  From: {dateFrom}
                </Badge>
              )}
              {dateTo && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200">
                  <Calendar className="w-3 h-3 mr-1" />
                  To: {dateTo}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Actions */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          {exporting && exportProgress > 0 && (
            <div className="mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                  <span className="text-sm font-semibold">Generating export...</span>
                </div>
                <span className="text-sm font-bold text-blue-600">{Math.round(exportProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-gray-900">Ready to Export</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>
                    Format: <span className="font-medium">{exportFormat.toUpperCase()}</span>
                  </span>
                </div>
                {includeStats && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>With statistics</span>
                  </div>
                )}
                {hasActiveFilters && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Filtered data</span>
                  </div>
                )}
              </div>
            </div>
            <Button
              onClick={handleExport}
              disabled={exporting}
              size="lg"
              className="h-12 px-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Download className="w-4 h-4 mr-2" />
              {exporting ? "Exporting..." : "Export Data"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Export Options */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span>Quick Export Options</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-center space-y-3 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-green-200 rounded-2xl transition-all duration-200 hover:scale-105"
              onClick={() => {
                clearFilters()
                setExportFormat("excel")
                handleExport()
              }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-700">All Resources</div>
                <div className="text-xs text-green-600 mt-1">Complete database export</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-center space-y-3 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200 rounded-2xl transition-all duration-200 hover:scale-105"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-blue-700">By Department</div>
                <div className="text-xs text-blue-600 mt-1">Department-wise export</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-center space-y-3 bg-gradient-to-br from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100 border-purple-200 rounded-2xl transition-all duration-200 hover:scale-105"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-purple-700">Recent Additions</div>
                <div className="text-xs text-purple-600 mt-1">Last 30 days</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
