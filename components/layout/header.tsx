"use client"

import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { LogOut, User, Settings, Shield } from "lucide-react"
import { useState, useEffect } from "react"

export default function Header() {
  const { user, logout } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    setMounted(true)

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY > lastScrollY) {
        // Scrolling down
        setVisible(false)
      } else {
        // Scrolling up
        setVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [lastScrollY])
  return (
    <header className="relative">
      {/* Floating Header Container */}
      <div
        className={cn(
          "fixed top-4 left-80 right-4 z-40 transition-all duration-700 ease-out",
          mounted ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0",
          !visible && "translate-y-[-100%] opacity-0"
        )}
      >
        <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-black/10 px-8 py-4 overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-purple-50/20 to-pink-50/30 animate-pulse"></div>

          {/* Floating Orbs */}
          <div className="absolute top-2 right-20 w-16 h-16 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-2 left-40 w-12 h-12 bg-gradient-to-br from-pink-400/10 to-orange-400/10 rounded-full blur-lg animate-pulse delay-1000"></div>

          <div className="relative flex items-center justify-between">
            {/* Welcome Section */}
            <div
              className={cn(
                "flex items-center space-x-6 transition-all duration-500 delay-200",
                mounted ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0",
              )}
            >
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                  Welcome back, Admin
                </h2>
              </div>
            </div>

            {/* Actions Section */}
            <div
              className={cn(
                "flex items-center space-x-3 transition-all duration-500 delay-300",
                mounted ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0",
              )}
            >
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-12 w-12 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/20 hover:bg-white/70 hover:border-white/40 transition-all duration-300 hover:scale-110 group shadow-lg hover:shadow-xl p-0"
                  >
                    <div className="relative">
                      <Avatar className="h-9 w-9 ring-2 ring-white/50 group-hover:ring-white/80 transition-all duration-300">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 text-white font-bold text-sm">
                          {user?.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      {/* Status Indicator */}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-lg">
                        <div className="absolute inset-0.5 bg-white rounded-full animate-ping"></div>
                      </div>

                      {/* Hover Glow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  className="w-80 p-0 bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-black/10 overflow-hidden"
                  align="end"
                  forceMount
                  sideOffset={8}
                >
                  {/* User Info Header */}
                  <DropdownMenuLabel className="font-normal p-0">
                    <div className="relative p-6 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 border-b border-white/10">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>

                      <div className="relative flex items-center space-x-4">
                        <div className="relative">
                          <Avatar className="h-14 w-14 ring-4 ring-white/50 shadow-lg">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 text-white font-bold text-lg">
                              {user?.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-lg">
                            <div className="absolute inset-1 bg-white rounded-full animate-pulse"></div>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-lg font-bold text-gray-900 truncate">{user?.name}</p>
                          <p className="text-sm text-gray-600 truncate">{user?.email}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 text-xs">
                              <Shield className="w-3 h-3 mr-1" />
                              {user?.role?.toUpperCase()}
                            </Badge>
                            <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 rounded-full">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-xs font-medium text-green-700">Online</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuLabel>

                  <div className="p-2 space-y-1">
                    <DropdownMenuItem className="p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 cursor-pointer group">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg group-hover:from-blue-200 group-hover:to-purple-200 transition-colors">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Profile Settings</p>
                          <p className="text-xs text-gray-500">Manage your account</p>
                        </div>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="p-4 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 cursor-pointer group">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg group-hover:from-purple-200 group-hover:to-pink-200 transition-colors">
                          <Settings className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Preferences</p>
                          <p className="text-xs text-gray-500">Customize your experience</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  </div>

                  <DropdownMenuSeparator className="mx-2 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                  <div className="p-2">
                    <DropdownMenuItem
                      onClick={logout}
                      className="p-4 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-red-100 to-pink-100 rounded-lg group-hover:from-red-200 group-hover:to-pink-200 transition-colors">
                          <LogOut className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium">Sign Out</p>
                          <p className="text-xs text-gray-500">End your session</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-24"></div>
    </header>
  )
}
