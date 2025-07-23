"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, Edit, Trash2, ChevronLeft, ChevronRight, Package, TrendingUp } from "lucide-react"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import ResourceFormModal from "./resource-form-modal"
import type { Resource, ResourcesResponse, ResourceFilters } from "@/lib/types"

interface ResourcesTableProps {
  filters: ResourceFilters
  refreshTrigger: number
}

export default function ResourcesTable({ filters, refreshTrigger }: ResourcesTableProps) {
  const { user } = useAuth()
  const [resources, setResources] = useState<Resource[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 10,
    total_count: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false,
  })
  const [loading, setLoading] = useState(true)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [deletingResource, setDeletingResource] = useState<Resource | null>(null)
  const [showResourceModal, setShowResourceModal] = useState(false)

  useEffect(() => {
    fetchResources()
  }, [filters, refreshTrigger, pagination.page])

  const fetchResources = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        per_page: pagination.per_page.toString(),
        ...filters,
      })

      const response = await api.get(`/resources?${params}`)
      const data: ResourcesResponse = response.data

      setResources(data.resources)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Failed to fetch resources:", error)
      setResources([])
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource)
    setShowResourceModal(true)
  }

  const handleDelete = async () => {
    if (!deletingResource) return

    try {
      await api.delete(`/resources/${deletingResource._id}`)
      setDeletingResource(null)
      fetchResources() // Refresh the table
    } catch (error) {
      console.error("Failed to delete resource:", error)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN")
  }

  const getDepartmentColor = (department: string) => {
    const colors = [
      "bg-blue-100 text-blue-800 border-blue-200",
      "bg-green-100 text-green-800 border-green-200",
      "bg-purple-100 text-purple-800 border-purple-200",
      "bg-orange-100 text-orange-800 border-orange-200",
      "bg-pink-100 text-pink-800 border-pink-200",
      "bg-teal-100 text-teal-800 border-teal-200",
      "bg-indigo-100 text-indigo-800 border-indigo-200",
      "bg-yellow-100 text-yellow-800 border-yellow-200",
    ]
    const index = department.length % colors.length
    return colors[index]
  }

  if (loading) {
    return (
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-lg animate-pulse">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Resources</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Loading your resources...</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl animate-pulse stagger-${(i % 5) + 1}`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-lg">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Resources ({pagination.total_count} total)</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Manage your campus laboratory equipment</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 px-3 py-1 rounded-full border border-green-200">
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-xs font-medium text-green-700">Live Data</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {resources.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No resources found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                No resources match your current filters. Try adjusting your search criteria or add new resources to get
                started.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-2xl border-0 overflow-hidden shadow-lg bg-white/90 backdrop-blur-sm">
                <Table className="table-modern">
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 border-0">
                      <TableHead className="w-16 font-semibold text-gray-700">SL No</TableHead>
                      <TableHead className="font-semibold text-gray-700">Device Name</TableHead>
                      <TableHead className="font-semibold text-gray-700">Department</TableHead>
                      <TableHead className="font-semibold text-gray-700">Location</TableHead>
                      <TableHead className="text-right font-semibold text-gray-700">Quantity</TableHead>
                      <TableHead className="text-right font-semibold text-gray-700">Cost</TableHead>
                      <TableHead className="font-semibold text-gray-700">Procurement Date</TableHead>
                      {user?.role === "admin" && (
                        <TableHead className="w-16 font-semibold text-gray-700">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resources.map((resource, index) => (
                      <TableRow
                        key={resource._id}
                        className={`border-gray-100 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200 animate-fade-in-up stagger-${(index % 5) + 1}`}
                      >
                        <TableCell className="font-medium text-gray-900">{resource.sl_no}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-semibold text-gray-900">{resource.device_name}</div>
                            {resource.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs mt-1">{resource.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${getDepartmentColor(resource.department)} border font-medium px-3 py-1 rounded-full`}
                          >
                            {resource.department}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-gray-700">{resource.location}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-semibold inline-block">
                            {resource.quantity}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          {formatCurrency(resource.cost)}
                        </TableCell>
                        <TableCell className="text-gray-600">{formatDate(resource.procurement_date)}</TableCell>
                        {user?.role === "admin" && (
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="h-8 w-8 p-0 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-110"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="z-[100] bg-white/95 backdrop-blur-md border-0 shadow-2xl rounded-xl"
                              >
                                <DropdownMenuItem
                                  onClick={() => handleEdit(resource)}
                                  className="hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setDeletingResource(resource)}
                                  className="text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Enhanced Pagination */}
              {pagination.total_pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-xl">
                    Showing {(pagination.page - 1) * pagination.per_page + 1} to{" "}
                    {Math.min(pagination.page * pagination.per_page, pagination.total_count)} of{" "}
                    {pagination.total_count} results
                  </div>
                  <div className="pagination-modern">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.has_prev}
                      className="pagination-button"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <div className="flex items-center space-x-2 px-4">
                      <span className="text-sm font-medium">
                        Page {pagination.page} of {pagination.total_pages}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.has_next}
                      className="pagination-button"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Resource Form Modal */}
      <ResourceFormModal
        isOpen={showResourceModal}
        onClose={() => {
          setShowResourceModal(false)
          setEditingResource(null)
        }}
        onSuccess={fetchResources}
        resource={editingResource}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingResource} onOpenChange={() => setDeletingResource(null)}>
        <AlertDialogContent className="modal-modern">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the resource "{deletingResource?.device_name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
