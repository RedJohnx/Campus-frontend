"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Building2, MapPin, Package, DollarSign, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import type { Resource, Department } from "@/lib/types"

interface ResourceFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  resource?: Resource | null
}

export default function ResourceFormModal({ isOpen, onClose, onSuccess, resource }: ResourceFormModalProps) {
  const [formData, setFormData] = useState({
    device_name: "",
    quantity: "",
    description: "",
    procurement_date: "",
    location: "",
    cost: "",
    department: "",
  })
  const [departments, setDepartments] = useState<Department[]>([])
  const [availableLocations, setAvailableLocations] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      fetchDepartments()
      if (resource) {
        // Edit mode - populate form with existing data
        setFormData({
          device_name: resource.device_name,
          quantity: resource.quantity.toString(),
          description: resource.description,
          procurement_date: resource.procurement_date.split("T")[0], // Format for date input
          location: resource.location,
          cost: resource.cost.toString(),
          department: resource.department,
        })
      } else {
        // Create mode - reset form
        setFormData({
          device_name: "",
          quantity: "",
          description: "",
          procurement_date: "",
          location: "",
          cost: "",
          department: "",
        })
      }
      setErrors({})
    }
  }, [isOpen, resource])

  useEffect(() => {
    if (formData.department) {
      fetchDepartmentLocations(formData.department)
    } else {
      setAvailableLocations([])
    }
  }, [formData.department])

  const fetchDepartments = async () => {
    try {
      const response = await api.get("/resources/departments")
      setDepartments(response.data.departments)
    } catch (error) {
      console.error("Failed to fetch departments:", error)
    }
  }

  const fetchDepartmentLocations = async (departmentName: string) => {
    try {
      const response = await api.get(`/resources/departments/${encodeURIComponent(departmentName)}/locations`)
      setAvailableLocations(response.data.locations)
    } catch (error) {
      console.error("Failed to fetch locations:", error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.device_name.trim()) newErrors.device_name = "Device name is required"
    if (!formData.quantity || Number.parseInt(formData.quantity) <= 0) newErrors.quantity = "Valid quantity is required"
    if (!formData.location.trim()) newErrors.location = "Location is required"
    if (!formData.cost || Number.parseFloat(formData.cost) < 0) newErrors.cost = "Valid cost is required"
    if (!formData.department) newErrors.department = "Department is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      const submitData = {
        device_name: formData.device_name.trim(),
        quantity: Number.parseInt(formData.quantity),
        description: formData.description.trim(),
        procurement_date: formData.procurement_date || new Date().toISOString().split("T")[0],
        location: formData.location.trim(),
        cost: Number.parseFloat(formData.cost),
        department: formData.department,
      }

      if (resource) {
        // Update existing resource
        await api.put(`/resources/${resource._id}`, submitData)
      } else {
        // Create new resource
        await api.post("/resources", submitData)
      }

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error("Failed to save resource:", error)
      if (error.response?.data?.details) {
        setErrors(error.response.data.details)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] modal-modern max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-lg">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl">{resource ? "Edit Resource" : "Add New Resource"}</DialogTitle>
              <DialogDescription className="mt-1">
                {resource
                  ? "Update the resource information below."
                  : "Fill in the details to add a new resource to your inventory."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="border-0 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="w-4 h-4 mr-2 text-blue-600" />
                Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="device_name" className="text-sm font-medium text-gray-700">
                    Device Name *
                  </Label>
                  <Input
                    id="device_name"
                    value={formData.device_name}
                    onChange={(e) => handleInputChange("device_name", e.target.value)}
                    placeholder="Enter device name"
                    className={`input-enhanced mt-1 ${errors.device_name ? "border-red-500 focus:border-red-500" : ""}`}
                  />
                  {errors.device_name && <p className="text-sm text-red-500 mt-1">{errors.device_name}</p>}
                </div>

                <div>
                  <Label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                    Quantity *
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange("quantity", e.target.value)}
                    placeholder="Enter quantity"
                    className={`input-enhanced mt-1 ${errors.quantity ? "border-red-500 focus:border-red-500" : ""}`}
                  />
                  {errors.quantity && <p className="text-sm text-red-500 mt-1">{errors.quantity}</p>}
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Enter description (optional)"
                  rows={3}
                  className="input-enhanced mt-1 resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card className="border-0 bg-gradient-to-r from-green-50 to-teal-50">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-green-600" />
                Location Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department" className="text-sm font-medium text-gray-700">
                    Department *
                  </Label>
                  <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                    <SelectTrigger
                      className={`input-enhanced mt-1 ${errors.department ? "border-red-500 focus:border-red-500" : ""}`}
                    >
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent className="z-[100] max-h-[200px] overflow-y-auto bg-white/95 backdrop-blur-md border-0 shadow-2xl rounded-xl">
                      {departments.map((dept) => (
                        <SelectItem key={dept._id} value={dept.name}>
                          <div className="flex items-center space-x-2">
                            <Building2 className="w-3 h-3 text-blue-500" />
                            <span>{dept.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.department && <p className="text-sm text-red-500 mt-1">{errors.department}</p>}
                </div>

                <div>
                  <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                    Location *
                  </Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) => handleInputChange("location", value)}
                    disabled={!formData.department}
                  >
                    <SelectTrigger
                      className={`input-enhanced mt-1 ${errors.location ? "border-red-500 focus:border-red-500" : ""}`}
                    >
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent className="z-[100] max-h-[200px] overflow-y-auto bg-white/95 backdrop-blur-md border-0 shadow-2xl rounded-xl">
                      {availableLocations.map((location) => (
                        <SelectItem key={location} value={location}>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-3 h-3 text-green-500" />
                            <span>{location}</span>
                          </div>
                        </SelectItem>
                      ))}
                      <SelectItem value="__new__">+ Add New Location</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.location === "__new__" && (
                    <Input
                      className="input-enhanced mt-2"
                      placeholder="Enter new location name"
                      onChange={(e) => handleInputChange("location", e.target.value)}
                    />
                  )}
                  {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card className="border-0 bg-gradient-to-r from-orange-50 to-yellow-50">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-orange-600" />
                Financial Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cost" className="text-sm font-medium text-gray-700">
                    Cost (₹) *
                  </Label>
                  <Input
                    id="cost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => handleInputChange("cost", e.target.value)}
                    placeholder="Enter cost"
                    className={`input-enhanced mt-1 ${errors.cost ? "border-red-500 focus:border-red-500" : ""}`}
                  />
                  {errors.cost && <p className="text-sm text-red-500 mt-1">{errors.cost}</p>}
                </div>

                <div>
                  <Label htmlFor="procurement_date" className="text-sm font-medium text-gray-700">
                    Procurement Date
                  </Label>
                  <Input
                    id="procurement_date"
                    type="date"
                    value={formData.procurement_date}
                    onChange={(e) => handleInputChange("procurement_date", e.target.value)}
                    className="input-enhanced mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl px-6 bg-transparent"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="btn-primary px-6">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? "Saving..." : resource ? "Update Resource" : "Add Resource"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
