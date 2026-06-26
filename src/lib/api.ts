const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface FetchOptions extends RequestInit {
  token?: string;
}

export const api = {
  async fetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { token, ...fetchOptions } = options;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers as Record<string, string>,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Request failed");
    }

    return data;
  },

  get<T>(endpoint: string, token?: string): Promise<T> {
    return this.fetch<T>(endpoint, { method: "GET", token });
  },

  post<T>(endpoint: string, body: any, token?: string): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      token,
    });
  },

  put<T>(endpoint: string, body: any, token?: string): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
      token,
    });
  },

  delete<T>(endpoint: string, token?: string): Promise<T> {
    return this.fetch<T>(endpoint, { method: "DELETE", token });
  },
};

export const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

export const getUser = (): any => {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }
  return null;
};

export const updateProfile = async (data: Partial<{ username: string; department: string; profile_picture: string }>): Promise<any> => {
  const token = getToken();
  return api.put("/auth/profile", data, token || undefined);
};

export const logout = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

export const apiService = {
  auth: {
    getMe: () => api.get<any>("/auth/me", getToken() || undefined),
    checkIp: () => api.get<{ success: boolean; allowed: boolean; ip: string }>("/auth/check-ip", getToken() || undefined),
    checkOffice: (ip: string) => api.post<any>("/auth/check-office", { ip }, getToken() || undefined),
    verifyAccess: (data: { client_ip?: string; latitude?: number; longitude?: number }) =>
      api.post<any>("/auth/verify-access", data, getToken() || undefined),
    updateProfile: (data: any) => api.put("/auth/profile", data, getToken() || undefined),
  },
  attendance: {
    clockIn: (data: any) => api.post<any>("/attendance/clock-in", data, getToken() || undefined),
    clockOut: (data: any) => api.post<any>("/attendance/clock-out", data, getToken() || undefined),
    getHistory: (params?: string) => api.get<any>(`/attendance/history${params ? `?${params}` : ""}`, getToken() || undefined),
    getStats: () => api.get<any>("/attendance/stats", getToken() || undefined),
  },
  employees: {
    list: (params?: string) => api.get<any>(`/employees${params ? `?${params}` : ""}`, getToken() || undefined),
    create: (data: any) => api.post<any>("/employees", data, getToken() || undefined),
    update: (id: string, data: any) => api.put<any>(`/employees/${id}`, data, getToken() || undefined),
    delete: (id: string) => api.delete<any>(`/employees/${id}`, getToken() || undefined),
    addToOffice: (data: { office_id: string; email: string }) => api.post<any>("/employees/add-to-office", data, getToken() || undefined),
    removeFromOffice: (data: { office_id: string; employee_id: string }) => api.post<any>("/employees/remove-from-office", data, getToken() || undefined),
    transfer: (data: { employee_id: string; from_office_id: string; to_office_id: string }) => api.post<any>("/employees/transfer", data, getToken() || undefined),
  },
  offices: {
    list: () => api.get<any>("/offices", getToken() || undefined),
    create: (data: any) => api.post<any>("/offices", data, getToken() || undefined),
    update: (id: string, data: any) => api.put<any>(`/offices/${id}`, data, getToken() || undefined),
    delete: (id: string) => api.delete<any>(`/offices/${id}`, getToken() || undefined),
    getMembers: (officeId: string) => api.get<any>(`/offices/${officeId}/members`, getToken() || undefined),
    getStats: (officeId: string, params?: string) => api.get<any>(`/offices/${officeId}/stats${params ? `?${params}` : ""}`, getToken() || undefined),
  },
  reports: {
    generate: (params?: string) => api.get<any>(`/reports/generate${params ? `?${params}` : ""}`, getToken() || undefined),
    teamStats: () => api.get<any>("/reports/team-stats", getToken() || undefined),
    officeStats: (params?: string) => api.get<any>(`/reports/office-stats${params ? `?${params}` : ""}`, getToken() || undefined),
    download: (params: string) => {
      const token = getToken();
      const url = `${API_URL}/reports/download?${params}`;
      const a = document.createElement("a");
      a.href = url;
      a.style.display = "none";
      if (token) {
        fetch(url, { headers: { Authorization: `Bearer ${token}` } })
          .then((r) => r.blob())
          .then((blob) => {
            const blobUrl = URL.createObjectURL(blob);
            a.href = blobUrl;
            a.download = `attendance-report-${new Date().toISOString().split("T")[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
          });
      }
    },
  },
  notifications: {
    list: () => api.get<any>("/notifications", getToken() || undefined),
    markAsRead: (id: string) => api.put<any>(`/notifications/${id}/read`, {}, getToken() || undefined),
    markAllAsRead: () => api.put<any>("/notifications/read-all", {}, getToken() || undefined),
  },
  settings: {
    get: () => api.get<any>("/settings", getToken() || undefined),
    update: (data: any) => api.put<any>("/settings", data, getToken() || undefined),
  },
};
