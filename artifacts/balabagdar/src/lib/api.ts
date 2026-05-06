const BASE_URL = "/api";

function getToken(): string | null {
  return localStorage.getItem("balahub_token");
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Request failed");
  return data;
}

export const api = {
  auth: {
    sendCode: (phone: string) =>
      request<{ success: boolean; dev_code?: string; channel: string; deepLink?: string }>("/auth/send-code", {
        method: "POST",
        body: JSON.stringify({ phone }),
      }),
    verifyCode: (phone: string, code: string) =>
      request<{ success: boolean; token: string; user: Record<string, unknown>; role: string | null }>("/auth/verify-code", {
        method: "POST",
        body: JSON.stringify({ phone, code }),
      }),
    registerEmail: (email: string, password: string) =>
      request<{ success: boolean; token: string; user: Record<string, unknown>; role: string | null }>("/auth/register-email", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    loginEmail: (email: string, password: string) =>
      request<{ success: boolean; token: string; user: Record<string, unknown>; role: string | null }>("/auth/login-email", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    setCredentials: (email: string, password: string) =>
      request<{ success: boolean }>("/auth/set-credentials", {
        method: "PUT",
        body: JSON.stringify({ email, password }),
      }),
    me: () =>
      request<{ user: Record<string, unknown>; role: string | null }>("/auth/me"),
    assignRole: (role: "parent" | "club_owner") =>
      request<{ role: string }>("/auth/assign-role", {
        method: "POST",
        body: JSON.stringify({ role }),
      }),
    updateProfile: (data: { firstName: string; lastName: string }) =>
      request<{ user: Record<string, unknown> }>("/auth/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    signOut: () =>
      request<{ success: boolean }>("/auth/signout", { method: "POST" }),
  },
  clubs: {
    list: (params?: { city?: string; category?: string; search?: string }) => {
      const qs = new URLSearchParams(params as any).toString();
      return request<any[]>(`/clubs${qs ? `?${qs}` : ""}`);
    },
    my: () => request<any | null>("/clubs/my"),
    get: (id: string) => request<any>(`/clubs/${id}`),
    create: (data: any) =>
      request<any>("/clubs", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<any>(`/clubs/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    schedules: (id: string) => request<any[]>(`/clubs/${id}/schedules`),
  },
  bookings: {
    create: (data: any) =>
      request<any>("/bookings", { method: "POST", body: JSON.stringify(data) }),
    mine: () => request<any[]>("/bookings/mine"),
    myClub: () => request<any[]>("/bookings/my-club"),
    updateStatus: (id: string, status: string) =>
      request<any>(`/bookings/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  },
  reviews: {
    forClub: (clubId: string) => request<any[]>(`/reviews/club/${clubId}`),
    submit: (clubId: string, data: any) =>
      request<any>(`/reviews/club/${clubId}`, { method: "POST", body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<any>(`/reviews/${id}`, { method: "DELETE" }),
    report: (id: string, reason = "") =>
      request<any>(`/reviews/${id}/report`, { method: "POST", body: JSON.stringify({ reason }) }),
  },
  upload: {
    file: async (file: File): Promise<string> => {
      const token = getToken();
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${BASE_URL}/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed");
      return data.url;
    },
  },
};
