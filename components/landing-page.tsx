"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BarChart3, MessageSquare, Upload, Sparkles } from "lucide-react"

export default function LandingPage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Campus Assets</h1>
            <p className="text-sm text-gray-600">Smart Management System</p>
          </div>
        </div>
        <div className="flex space-x-4">
          <Button variant="ghost" onClick={() => router.push("/login")}>
            Login
          </Button>
          <Button onClick={() => router.push("/login")}>Get Started</Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-blue-100 px-4 py-2 rounded-full flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-blue-600 text-sm font-medium">AI-Powered Asset Management</span>
            </div>
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Manage Your Campus Assets <span className="text-blue-600">Intelligently</span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Streamline your campus resource management with our comprehensive platform featuring AI-powered operations,
            real-time analytics, and seamless file management.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8" onClick={() => router.push("/login")}>
              <Sparkles className="w-5 h-5 mr-2" />
              Start Managing Assets
            </Button>
            <Button variant="outline" size="lg" onClick={() => router.push("/login")}>
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need to Manage Assets</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our platform provides all the tools you need to efficiently track, manage, and analyze your campus
            resources.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-8 text-center hover:shadow-lg transition-shadow">
            <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Real-time Dashboard</h3>
            <p className="text-gray-600">Get instant insights with comprehensive analytics and interactive charts</p>
          </Card>

          <Card className="p-8 text-center hover:shadow-lg transition-shadow">
            <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">AI Assistant</h3>
            <p className="text-gray-600">
              Use natural language to perform CRUD operations and get intelligent responses
            </p>
          </Card>

          <Card className="p-8 text-center hover:shadow-lg transition-shadow">
            <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Upload className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">File Management</h3>
            <p className="text-gray-600">Import/export data via CSV and Excel with bulk operations support</p>
          </Card>
        </div>
      </section>
    </div>
  )
}
