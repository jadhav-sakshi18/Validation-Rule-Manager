import { apiRequest } from "./apiClient";

export const getStatus = () => apiRequest("/status");

export const logoutUser = () =>
  apiRequest("/logout", { method: "GET" });

export const loginUser = (environment) => {
  window.location.href =
    `${import.meta.env.VITE_API_BASE}/login?env=${environment}`;
};