import { apiRequest } from "./apiClient";

export const fetchRules = () =>
  apiRequest("/validation-rules");

export const updateRule = (id, payload) =>
  apiRequest(`/validation-rules/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });