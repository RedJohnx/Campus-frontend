import axios from "axios";

export const api = axios.create({
  baseURL: "https://warp-ai-hackathon.el.r.appspot.com/api",
  timeout: 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// API endpoints based on backend structure
export const endpoints = {
  // Authentication
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
  },

  // Resources
  resources: {
    list: "/resources",
    create: "/resources",
    get: (id: string) => `/resources/${id}`,
    update: (id: string) => `/resources/${id}`,
    delete: (id: string) => `/resources/${id}`,
    search: "/resources/search",
    advancedSearch: "/resources/advanced-search",
    filterOptions: "/resources/filter-options",
    quickFilters: "/resources/quick-filters",
    departments: "/resources/departments",
    departmentLocations: (dept: string) =>
      `/resources/departments/${dept}/locations`,
    locationDevices: (dept: string, loc: string) =>
      `/resources/filter/devices/${encodeURIComponent(
        dept
      )}/${encodeURIComponent(loc)}`,
    allLocationDevices: (loc: string) =>
      `/resources/filter/devices/all/${encodeURIComponent(loc)}`,
  },

  // Dashboard
  dashboard: {
    overview: "/dashboard/overview",
    departmentAnalytics: "/dashboard/department-analytics",
    costAnalysis: "/dashboard/cost-analysis",
    utilizationMetrics: "/dashboard/utilization-metrics",
    charts: "/dashboard/charts",
  },

  // Export
  export: {
    csv: "/export/csv",
    excel: "/export/excel",
    pdf: "/export/pdf",
    json: "/export/json",
    department: (dept: string) =>
      `/export/department/${encodeURIComponent(dept)}`,
    location: (loc: string) => `/export/location/${encodeURIComponent(loc)}`,
    filtered: "/export/filtered",
    bulk: "/export/bulk",
    template: "/export/csv/template",
  },

  // File Upload
  upload: {
    upload: "/upload/upload",
    template: "/upload/template",
    supportedFormats: "/upload/supported-formats",
    import: "/upload/import",
  },

  // AI Integration
  ai: {
    chat: "/ai/chat",
    status: "/ai/status",
    crud: "/ai/crud",
    queryDatabase: "/ai/query-database",
  },
};
