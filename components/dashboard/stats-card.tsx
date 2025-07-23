"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: LucideIcon
  color: "blue" | "green" | "purple" | "orange" | "teal" | string
  trend?: {
    value: number
    isPositive: boolean
  }
}

const colorConfig = {
  blue: {
    gradient: "bg-gradient-to-br from-blue-500 to-blue-600",
    iconBg: "bg-blue-50 dark:bg-blue-900/20",
    iconColor: "text-blue-600 dark:text-blue-400",
    cardBg: "bg-gradient-to-br from-blue-50 to-blue-100",
  },
  green: {
    gradient: "bg-gradient-to-br from-green-500 to-green-600",
    iconBg: "bg-green-50 dark:bg-green-900/20",
    iconColor: "text-green-600 dark:text-green-400",
    cardBg: "bg-gradient-to-br from-green-50 to-green-100",
  },
  purple: {
    gradient: "bg-gradient-to-br from-purple-500 to-purple-600",
    iconBg: "bg-purple-50 dark:bg-purple-900/20",
    iconColor: "text-purple-600 dark:text-purple-400",
    cardBg: "bg-gradient-to-br from-purple-50 to-purple-100",
  },
  orange: {
    gradient: "bg-gradient-to-br from-orange-500 to-orange-600",
    iconBg: "bg-orange-50 dark:bg-orange-900/20",
    iconColor: "text-orange-600 dark:text-orange-400",
    cardBg: "bg-gradient-to-br from-orange-50 to-orange-100",
  },
  teal: {
    gradient: "bg-gradient-to-br from-teal-500 to-teal-600",
    iconBg: "bg-teal-50 dark:bg-teal-900/20",
    iconColor: "text-teal-600 dark:text-teal-400",
    cardBg: "bg-gradient-to-br from-teal-50 to-teal-100",
  },
  default: {
    gradient: "bg-gradient-to-br from-gray-500 to-gray-600",
    iconBg: "bg-gray-50 dark:bg-gray-900/20",
    iconColor: "text-gray-600 dark:text-gray-400",
    cardBg: "bg-gradient-to-br from-gray-50 to-gray-100",
  },
}

export default function StatsCard({ title, value, subtitle, icon: Icon, color, trend }: StatsCardProps) {
  const config = colorConfig[color as keyof typeof colorConfig] || colorConfig.default

  const displayValue = typeof value === "string" ? value : value.toLocaleString()

  return (
    <Card className="relative overflow-hidden shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-3">
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</p>

            <div className="space-y-2">
              <p className="text-4xl font-bold text-gray-900 tracking-tight">{displayValue}</p>

              <div className="flex items-center space-x-3">
                <p className="text-sm text-gray-500 font-medium">{subtitle}</p>

                {trend && (
                  <div
                    className={cn(
                      "flex items-center text-xs font-semibold px-3 py-1 rounded-full",
                      trend.isPositive
                        ? "text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/20"
                        : "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/20",
                    )}
                  >
                    <span className="mr-1">{trend.isPositive ? "↗" : "↘"}</span>
                    {Math.abs(trend.value)}%
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={cn("p-4 rounded-2xl shadow-lg", config.iconBg)}>
            <Icon className={cn("w-8 h-8", config.iconColor)} />
          </div>
        </div>

        {/* Background decoration */}
        <div
          className={cn("absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full -mr-16 -mt-16", config.cardBg)}
        ></div>
      </CardContent>
    </Card>
  )
}
