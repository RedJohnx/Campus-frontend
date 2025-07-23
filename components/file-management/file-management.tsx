"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Download, FileText, Sparkles } from "lucide-react"
import ImportSection from "./import-section"
import ExportSection from "./export-section"

export default function FileManagementPage() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("import")
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const tabParam = searchParams.get("tab")
    if (tabParam === "export") {
      setActiveTab("export")
    }
    setTimeout(() => setIsLoaded(true), 200)
  }, [searchParams])

  return (
    <div
      className={`space-y-6 transition-all duration-700 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      {/* Header */}
      <Card className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white border-0 shadow-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

        <CardContent className="p-8 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                  <FileText className="w-8 h-8" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold">File Management</h1>
                <p className="text-orange-100 mt-1">Import and export your campus asset data seamlessly</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">Smart Processing</div>
                <div className="text-xs text-orange-200">AI-powered validation</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100/50 p-1 rounded-xl">
              <TabsTrigger
                value="import"
                className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
              >
                <Upload className="w-4 h-4" />
                <span>Import Data</span>
              </TabsTrigger>
              <TabsTrigger
                value="export"
                className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
              >
                <Download className="w-4 h-4" />
                <span>Export Data</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="import" className="mt-0">
                <ImportSection />
              </TabsContent>

              <TabsContent value="export" className="mt-0">
                <ExportSection />
              </TabsContent>
            </div>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  )
}
