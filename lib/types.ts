export interface User {
  _id: string
  id?: string
  uid: string
  email: string
  name?: string
  role: "admin" | "viewer" | "user"
  status: "active" | "pending" | "suspended"
  created_at: string
  last_login?: string
}

export interface Resource {
  _id: string
  id?: string
  sl_no: number
  device_name: string
  quantity: number
  description?: string
  procurement_date: string
  location: string
  cost: number
  department: string
  created_by: string
  created_at: string
  updated_at: string
  updated_by: string
}

export interface Department {
  _id: string
  id?: string
  name: string
  locations: string[]
  created_at: string
  resource_count: number
  total_cost: number
  total_value?: number
}
export interface DepartmentStats {
  total_resources: number
  total_cost: number
  unique_devices: number
  locations_count: number
}

export interface DepartmentWithStats {
  name: string
  locations: string[]
  device_types: string[]
  stats: DepartmentStats
}

export interface FilterOptions {
  departments: DepartmentWithStats[]
  summary: {
    total_departments: number
    total_locations: number
    total_device_types: number
  }
}

export interface ResourceFilters {
  department?: string
  location?: string
  device_name?: string
  search?: string
}

export interface PaginationInfo {
  page: number
  per_page: number
  total_count: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface ResourcesResponse {
  resources: Resource[]
  pagination: PaginationInfo
  filters: ResourceFilters
}

export interface ChatMessage {
  id?: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  resources?: any[]
  statistics?: {
    total_resources: number
    total_cost: number
  }
}

export interface ChatSession {
  _id: string
  user_id: string
  session_title: string
  messages: ChatMessage[]
  created_at: string
  last_activity: string
}
