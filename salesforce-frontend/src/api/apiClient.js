const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export async function fetchJSON(url, options = {}) {
  const response = await fetch(`${API_BASE}${url}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "API request failed");
  }

  return data;
}