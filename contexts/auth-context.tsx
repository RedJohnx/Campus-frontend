"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "viewer"
  status: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (token) {
      verifyToken(token)
    } else {
      setLoading(false)
    }
  }, [])

  const verifyToken = async (token: string) => {
    try {
      const response = await api.get("/auth/verify", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.data.valid) {
        setUser(response.data.user)
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`
      } else {
        localStorage.removeItem("auth_token")
      }
    } catch (error) {
      localStorage.removeItem("auth_token")
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password })
      const { token, user: userData } = response.data

      localStorage.setItem("auth_token", token)
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
      setUser(userData)

      router.push("/dashboard")
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Login failed")
    }
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    delete api.defaults.headers.common["Authorization"]
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
