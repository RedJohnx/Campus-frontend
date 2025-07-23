"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Package, MessageSquare, FileText, Building2, ChevronRight, Zap, Activity } from "lucide-react"
import { useState, useEffect } from "react"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    color: "from-blue-500 via-blue-600 to-cyan-500",
    bgColor: "from-blue-50 via-blue-100 to-cyan-50",
    description: "Overview & Analytics",
  },
  {
    name: "Resources",
    href: "/resources",
    icon: Package,
    color: "from-emerald-500 via-green-600 to-teal-500",
    bgColor: "from-emerald-50 via-green-100 to-teal-50",
    description: "Asset Management",
  },
  {
    name: "AI Assistant",
    href: "/ai-assistant",
    icon: MessageSquare,
    color: "from-purple-500 via-violet-600 to-indigo-500",
    bgColor: "from-purple-50 via-violet-100 to-indigo-50",
    description: "Smart Assistant",
  },
  {
    name: "File Management",
    href: "/file-management",
    icon: FileText,
    color: "from-orange-500 via-amber-600 to-yellow-500",
    bgColor: "from-orange-50 via-amber-100 to-yellow-50",
    description: "Import & Export",
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="relative">
      {/* Floating Sidebar Container */}
      <div className="fixed left-4 top-4 bottom-4 w-72 z-50">
        {/* Main Sidebar */}
        <div className="h-full bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl shadow-black/10 flex flex-col overflow-hidden">
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 animate-pulse"></div>

          {/* Floating Orbs */}
          <div className="absolute top-10 right-8 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 left-6 w-16 h-16 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-lg animate-pulse delay-1000"></div>

          {/* Header Section */}
          <div className="relative p-6 border-b border-white/10">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                {/* Icon Container with Floating Effect */}
                <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-4 rounded-2xl shadow-lg shadow-blue-500/25 group-hover:shadow-xl group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-110">
                  <Building2 className="w-7 h-7 text-white" />

                  {/* Animated Ring */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-blue-400/50 animate-ping"></div>

                  {/* Status Indicator */}
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-lg animate-pulse">
                    <div className="absolute inset-0.5 bg-white rounded-full animate-ping"></div>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                  Campus Assets
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Activity className="w-3 h-3 text-green-500 animate-pulse" />
                  <span className="text-sm text-gray-600 font-medium">Smart Management</span>
                  <div className="px-2 py-0.5 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full">
                    <span className="text-xs font-semibold text-green-700">LIVE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Section */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const isHovered = hoveredItem === item.name

              return (
                <div key={item.name} className="relative">
                  <Link
                    href={item.href}
                    onMouseEnter={() => setHoveredItem(item.name)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={cn(
                      "group relative flex items-center space-x-4 p-3 rounded-2xl text-sm font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]",
                      isActive
                        ? "bg-white/50 border border-white/40 shadow-lg shadow-black/5 text-gray-800"
                        : "text-gray-600 hover:bg-white/50 hover:text-gray-900 hover:shadow-md hover:border hover:border-white/30",
                    )}
                  >
                    {/* Underline Effect */}
                    {isActive && (
                      <div 
                        className={cn(
                          "absolute bottom-0 left-0 h-1 rounded-full bg-gradient-to-r transition-all duration-500",
                          item.color,
                          "w-full"
                        )}
                      ></div>
                    )}

                    {/* Hover Glow Effect */}
                    {isHovered && !isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl animate-pulse"></div>
                    )}
                    {/* Icon Container */}
                    <div className="relative">
                      <div
                        className={cn(
                          "relative p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110",
                          isActive || isHovered
                            ? `bg-gradient-to-br ${item.color} shadow-lg`
                            : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-gray-200 group-hover:to-gray-300",
                        )}
                      >
                        <item.icon
                          className={cn(
                            "w-4 h-4 transition-all duration-300",
                            isActive || isHovered ? "text-white" : "text-gray-500 group-hover:text-gray-700",
                          )}
                        />

                        {/* Icon Glow Effect */}
                        {(isActive || isHovered) && (
                          <div
                            className={cn(
                              "absolute inset-0 rounded-xl bg-gradient-to-br opacity-50 animate-pulse",
                              item.color,
                            )}
                          ></div>
                        )}
                      </div>
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold truncate">{item.name}</span>
                        <ChevronRight
                          className={cn(
                            "w-4 h-4 transition-all duration-300",
                            isActive || isHovered ? "translate-x-1 opacity-100" : "translate-x-0 opacity-0",
                          )}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{item.description}</p>
                    </div>

                    {/* Hover Arrow */}
                    <div
                      className={cn(
                        "absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-300",
                        isHovered ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0",
                      )}
                    >
                      <div className={cn("w-2 h-2 rounded-full bg-gradient-to-r", item.color)}></div>
                    </div>
                  </Link>
                </div>
              )
            })}
          </nav>


        </div>
      </div>
    </div>
  )
}
