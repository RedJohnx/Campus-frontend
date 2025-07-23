"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Info,
  Download,
  Settings,
  Sparkles,
  Zap,
  Database,
  Building2,
  Plus,
} from "lucide-react"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import type { FilterOptions } from "@/lib/types"

interface Department {
  _id: string
  name: string
  resource_count: number
  total_cost: number
  created_at: string
  locations?: string[]
}

export default function ImportSection() {
  const { user } = useAuth()
  const [department, setDepartment] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [validationResults, setValidationResults] = useState<any>(null)
  const [importing, setImporting] = useState(false)
  const [importResults, setImportResults] = useState<any>(null)
  const [processingStep, setProcessingStep] = useState("")
  const [departments, setDepartments] = useState<Department[]>([])
  const [loadingDepartments, setLoadingDepartments] = useState(false)
  const [useCustomDepartment, setUseCustomDepartment] = useState(false)
  const [customDepartment, setCustomDepartment] = useState("")

  // Fetch departments when component mounts
  useEffect(() => {
    fetchDepartments()
  }, [])

  // Fetch departments using the same endpoint as resources filter
  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true)
      const timestamp = new Date().getTime()
      const response = await api.get(`/resources/filter-options?_t=${timestamp}`)

      if (response.data && response.data.departments) {
        // Convert FilterOptions format to Department format for compatibility
        const departmentData = response.data.departments.map((dept: any) => ({
          _id: `dept_${dept.name}`,
          name: dept.name,
          resource_count: dept.stats.total_resources,
          total_cost: dept.stats.total_cost,
          created_at: new Date().toISOString(),
          locations: dept.locations || []
        }))
        setDepartments(departmentData)
      }
    } catch (error) {
      console.error("Failed to fetch departments:", error)
      toast.error("Failed to load departments")
    } finally {
      setLoadingDepartments(false)
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setUploadedFile(file)
      setValidationResults(null)
      setImportResults(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
  })

  const handleUpload = async () => {
    const selectedDepartment = useCustomDepartment ? customDepartment : department
    if (!uploadedFile || !selectedDepartment.trim()) return

    const formData = new FormData()
    formData.append("file", uploadedFile)
    formData.append("department", selectedDepartment)

    try {
      setUploadProgress(0)
      setProcessingStep("Uploading file...")

      const response = await api.post("/upload/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))
          setUploadProgress(progress)

          if (progress < 30) setProcessingStep("Uploading file...")
          else if (progress < 60) setProcessingStep("Analyzing structure...")
          else if (progress < 90) setProcessingStep("Validating data...")
          else setProcessingStep("Finalizing...")
        },
      })

      setValidationResults(response.data)
      setProcessingStep("Upload complete!")
      
      // Show success message and handle new department creation
      if (response.data.department_created) {
        toast.success(`New department "${selectedDepartment}" created and file validated successfully!`)
        // Refresh departments list to include the new department
        fetchDepartments()
      } else {
        toast.success("File uploaded and validated successfully!")
      }
    } catch (error: any) {
      console.error("Upload failed:", error)
      setProcessingStep("Upload failed")
      toast.error("Upload failed: " + (error.response?.data?.error || error.message))
    }
  }

  const handleImport = async () => {
    if (!validationResults?.file_id) return

    try {
      setImporting(true)
      setProcessingStep("Processing import...")

      const selectedDepartment = useCustomDepartment ? customDepartment : department
      const response = await api.post("/upload/import", {
        file_id: validationResults.file_id,
        department: selectedDepartment,
        proceed_with_warnings: true,
      })

      setImportResults(response.data)
      setProcessingStep("Import completed!")
      
      // Show success message and handle new department creation
      if (response.data.department_created) {
        toast.success(`Data imported successfully with new department "${selectedDepartment}"!`)
        // Refresh departments list to include the new department
        fetchDepartments()
      } else {
        toast.success("Data imported successfully!")
      }
    } catch (error: any) {
      console.error("Import failed:", error)
      setProcessingStep("Import failed")
      toast.error("Import failed: " + (error.response?.data?.error || error.message))
    } finally {
      setImporting(false)
    }
  }

  const downloadTemplate = async () => {
    try {
      const response = await api.get("/upload/template", {
        responseType: "blob",
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", "resource_import_template.csv")
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success("Template downloaded successfully!")
    } catch (error) {
      console.error("Failed to download template:", error)
      toast.error("Failed to download template")
    }
  }

  if (user?.role !== "admin") {
    return (
      <Card className="shadow-xl border-0 bg-gradient-to-br from-amber-50 to-orange-50 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Admin Access Required</h3>
          <p className="text-gray-600 mb-6">
            Only administrators can import data into the system for security reasons.
          </p>
          <Button
            variant="outline"
            className="rounded-xl bg-transparent hover:bg-amber-50 transition-colors duration-200"
          >
            Contact Administrator
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Step 1: Configure Department */}
      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm relative z-20">
        <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
          <CardTitle className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Settings className="w-5 h-5" />
            </div>
            <span>Step 1: Configure Parent Department</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Alert className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 backdrop-blur-sm">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Why Parent Department?</strong>
              <br />
              All imported resources will be tagged with this Parent Department for better organization and tracking.
              The department information within your file will be preserved separately for detailed categorization.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="custom-department"
                checked={useCustomDepartment}
                onCheckedChange={setUseCustomDepartment}
                className="rounded border-gray-300"
              />
              <Label htmlFor="custom-department" className="text-sm font-medium text-gray-700 cursor-pointer">
                Enter new department manually
              </Label>
            </div>

            {useCustomDepartment ? (
              <div className="space-y-3">
                <Label htmlFor="custom-department-input" className="text-sm font-semibold text-gray-700">
                  New Department Name
                </Label>
                <div className="relative">
                  <Input
                    id="custom-department-input"
                    value={customDepartment}
                    onChange={(e) => setCustomDepartment(e.target.value)}
                    placeholder="Enter new department name (e.g., Artificial Intelligence & Machine Learning)"
                    className="h-12 pl-12 border-gray-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl"
                  />
                  <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Label htmlFor="department-select" className="text-sm font-semibold text-gray-700">
                  Select Existing Department
                </Label>
                <div className="relative">
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger className="h-12 pl-12 border-gray-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <SelectValue placeholder="Choose from existing departments..." />
                    </SelectTrigger>
                    <SelectContent
                      className="z-[100000] max-h-[300px] overflow-y-auto bg-white/95 backdrop-blur-sm border shadow-xl rounded-xl"
                      position="popper"
                      sideOffset={5}
                    >
                      {loadingDepartments ? (
                        <SelectItem value="loading" disabled>
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin"></div>
                            <span>Loading departments...</span>
                          </div>
                        </SelectItem>
                      ) : departments.length > 0 ? (
                        departments.map((dept) => (
                          <SelectItem
                            key={dept._id}
                            value={dept.name}
                            className="cursor-pointer hover:bg-green-50 transition-colors focus:bg-green-50"
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center space-x-2">
                                <Building2 className="w-4 h-4 text-green-600" />
                                <span className="truncate max-w-[200px]">{dept.name}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <span>{dept.resource_count} resources</span>
                                <span>•</span>
                                <span>₹{dept.total_cost.toLocaleString()}</span>
                              </div>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-departments" disabled>
                          <div className="flex items-center space-x-2 text-gray-500">
                            <AlertCircle className="w-4 h-4" />
                            <span>No departments found</span>
                          </div>
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Upload Files */}
      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm relative z-10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-lg">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <span>Step 2: Upload Your Files</span>
          </CardTitle>
          <p className="text-gray-600">Choose your preferred file format and start importing</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CSV Import */}
            <Card className="border-2 border-green-200 hover:border-green-300 transition-all duration-200 overflow-hidden hover:shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>CSV Import</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${isDragActive
                    ? "border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 scale-105 shadow-lg"
                    : "border-gray-300 hover:border-green-400 hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 hover:shadow-md"
                    }`}
                >
                  <input {...getInputProps()} />
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Drop your CSV file here</h3>
                      <p className="text-gray-600 mb-4">or click to browse and select</p>
                    </div>

                    {uploadedFile && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200 shadow-sm">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-green-600" />
                          <div className="text-left">
                            <p className="text-sm font-semibold text-green-800 truncate">{uploadedFile.name}</p>
                            <p className="text-xs text-green-600">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        const selectedDept = useCustomDepartment ? customDepartment : department
                        if (!selectedDept.trim()) {
                          toast.error("Please set department first")
                          return
                        }
                      }}
                      disabled={!(useCustomDepartment ? customDepartment.trim() : department.trim())}
                      className="rounded-xl hover:bg-green-50 transition-colors duration-200"
                    >
                      {(useCustomDepartment ? customDepartment.trim() : department.trim())
                        ? "Ready to Upload"
                        : "Set Department First"}
                    </Button>
                  </div>
                </div>

                <div className="mt-6 bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-xl border border-gray-200">
                  <h4 className="font-semibold mb-3 flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-green-600" />
                    <span>Required Columns:</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                    {["SL No", "Device Name", "Quantity", "Description", "Procurement Date", "Location", "Cost"].map(
                      (column, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>{column}</span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Excel Import */}
            <Card className="border-2 border-blue-200 hover:border-blue-300 transition-all duration-200 overflow-hidden hover:shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Excel Import</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${isDragActive
                    ? "border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 scale-105 shadow-lg"
                    : "border-gray-300 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:shadow-md"
                    }`}
                >
                  <input {...getInputProps()} />
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Drop your Excel file here</h3>
                      <p className="text-gray-600 mb-4">Supports .xlsx and .xls formats</p>
                    </div>

                    {uploadedFile && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 shadow-sm">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <div className="text-left">
                            <p className="text-sm font-semibold text-blue-800 truncate">{uploadedFile.name}</p>
                            <p className="text-xs text-blue-600">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        const selectedDept = useCustomDepartment ? customDepartment : department
                        if (!selectedDept.trim()) {
                          toast.error("Please set department first")
                          return
                        }
                      }}
                      disabled={!(useCustomDepartment ? customDepartment.trim() : department.trim())}
                      className="rounded-xl hover:bg-blue-50 transition-colors duration-200"
                    >
                      {(useCustomDepartment ? customDepartment.trim() : department.trim())
                        ? "Ready to Upload"
                        : "Set Department First"}
                    </Button>
                  </div>
                </div>

                <div className="mt-6 bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-xl border border-gray-200">
                  <h4 className="font-semibold mb-3 flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <span>Supported Formats:</span>
                  </h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    {[
                      "Standard tabular format (.xlsx, .xls)",
                      "Multi-section with location headers",
                      "Auto-detection of data structure",
                    ].map((format, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>{format}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upload Progress with Enhanced Animation */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <Card className="mt-6 border-0 bg-gradient-to-r from-blue-50 to-purple-50 shadow-xl backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-900">{processingStep}</span>
                        <p className="text-xs text-gray-600">Processing your file...</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-blue-600">{uploadProgress}%</span>
                  </div>

                  <div className="relative">
                    <Progress value={uploadProgress} className="h-3 bg-gray-200" />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
                  </div>

                  <div className="flex justify-center space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Button */}
          {uploadedFile &&
            (useCustomDepartment ? customDepartment.trim() : department.trim()) &&
            !validationResults && (
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={handleUpload}
                  disabled={uploadProgress > 0 && uploadProgress < 100}
                  className="h-12 px-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload and Validate
                </Button>
              </div>
            )}

          {/* Validation Results */}
          {validationResults && (
            <Card className="mt-6 border-0 bg-gradient-to-r from-green-50 to-teal-50 shadow-xl backdrop-blur-sm">
              <CardContent className="p-6 space-y-4">
                <Alert className="border-green-200 bg-green-50/50 backdrop-blur-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4" />
                      <span className="font-semibold">File uploaded successfully!</span>
                    </div>
                    <p className="mt-1">Found {validationResults.stats?.total_rows || 0} rows ready for processing.</p>
                  </AlertDescription>
                </Alert>

                {validationResults.warnings?.length > 0 && (
                  <Alert className="border-amber-200 bg-amber-50/50 backdrop-blur-sm">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      <div className="font-semibold mb-2">
                        Validation Warnings ({validationResults.warnings.length}):
                      </div>
                      <ul className="text-sm space-y-1 max-h-32 overflow-y-auto">
                        {validationResults.warnings.slice(0, 5).map((warning: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-1 h-1 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                            <span>{warning}</span>
                          </li>
                        ))}
                      </ul>
                      {validationResults.warnings.length > 5 && (
                        <p className="text-xs mt-2 text-amber-700">
                          +{validationResults.warnings.length - 5} more warnings...
                        </p>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-center">
                  <Button
                    onClick={handleImport}
                    disabled={importing}
                    className="h-12 px-8 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    {importing ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Processing Import...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Database className="w-4 h-4" />
                        <span>Proceed with Import</span>
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Import Results */}
          {importResults && (
            <Card className="mt-6 border-0 bg-gradient-to-r from-emerald-50 to-green-50 shadow-xl backdrop-blur-sm">
              <CardContent className="p-6">
                <Alert className="border-emerald-200 bg-emerald-50/50 backdrop-blur-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <AlertDescription className="text-emerald-800">
                    <div className="flex items-center space-x-2 mb-3">
                      <Sparkles className="w-5 h-5" />
                      <span className="font-bold text-lg">Import Completed Successfully! 🎉</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-white/50 p-3 rounded-lg backdrop-blur-sm">
                        <div className="font-semibold text-emerald-900">✅ Imported</div>
                        <div className="text-2xl font-bold text-emerald-700">{importResults.imported_count}</div>
                        <div className="text-xs text-emerald-600">resources added</div>
                      </div>
                      <div className="bg-white/50 p-3 rounded-lg backdrop-blur-sm">
                        <div className="font-semibold text-emerald-900">⏭️ Skipped</div>
                        <div className="text-2xl font-bold text-emerald-700">{importResults.skipped_count}</div>
                        <div className="text-xs text-emerald-600">duplicates avoided</div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Template Download */}
          <Card className="mt-6 border-0 bg-gradient-to-r from-gray-50 to-slate-50 shadow-xl backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-slate-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Download className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Need a Template?</h3>
                    <p className="text-sm text-gray-600">Download our standard import template to get started</p>
                  </div>
                </div>
                <Button
                  onClick={downloadTemplate}
                  variant="outline"
                  className="rounded-xl hover:bg-gray-100 transition-colors duration-200 bg-transparent shadow-sm hover:shadow-md"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
