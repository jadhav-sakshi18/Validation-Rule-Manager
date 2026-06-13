const API_BASE = import.meta.env.VITE_API_BASE;

export async function apiRequest(endpoint, options = {}) {
  const token = sessionStorage.getItem("authToken");

  const headers = {
    ...(options.headers || {}),
    ...(token ? { "X-Auth-Token": token } : {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "API request failed");
  }

  return data;
}
