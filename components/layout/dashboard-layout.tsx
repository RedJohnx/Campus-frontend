"use client"

import type React from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Sidebar from "./sidebar"
import Header from "./header"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [isLoaded, setIsLoaded] = useState(false)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    if (!loading) {
      setTimeout(() => setIsLoaded(true), 100)
      setTimeout(() => setShowContent(true), 800)
    }
  }, [loading])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-xl animate-pulse delay-500"></div>
        </div>

        {/* Main Loader Container */}
        <div className="relative z-10">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl shadow-black/10 border border-white/20 max-w-md w-full mx-4">
            <div className="flex flex-col items-center space-y-8">
              {/* Animated Logo/Icon */}
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center animate-pulse">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded"></div>
                  </div>
                </div>
                <div className="absolute inset-0 rounded-2xl border-2 border-blue-400/50 animate-ping"></div>
              </div>

              {/* Spinning Loader */}
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin">
                  <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
                </div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-600 rounded-full animate-spin delay-75"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-pink-600 rounded-full animate-spin delay-150"></div>
              </div>

              {/* Loading Text */}
              <div className="text-center space-y-3">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">
                  Loading Campus Assets
                </h3>
                <p className="text-gray-600 font-medium">Preparing your dashboard experience...</p>
              </div>

              {/* Loading Progress Dots */}
              <div className="flex space-x-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  ></div>
                ))}
              </div>

              {/* Loading Steps */}
              <div className="w-full space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Initializing...</span>
                  <span>100%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-20 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-gradient-to-br from-pink-400/10 to-orange-400/10 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <main className="relative ml-80 mt-4">
        <div
          className={cn(
            "transition-all duration-700 ease-out",
            showContent ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
          )}
        >
          <div className="p-8">
            {/* Content Container */}
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl shadow-black/5 border border-white/20 min-h-[calc(100vh-200px)] p-8 relative overflow-hidden">
              {/* Content Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30 animate-pulse"></div>

              {/* Content */}
              <div className="relative z-10">{children}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
