import axios from "axios";

function normalizeBaseUrl(url?: string): string {
  if (!url) {
    return "http://localhost:8080/api";
  }
  return url.replace(/\/+$/, "");
}

export function getApiBaseUrl(): string {
  return normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);
}

export function getBackendOrigin(): string {
  const apiBaseUrl = getApiBaseUrl();
  return apiBaseUrl.replace(/\/api$/, "");
}

export function toAbsoluteBackendUrl(url?: string | null): string {
  if (!url) return "";

  const value = url.trim();
  if (!value) return "";

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${getBackendOrigin()}${value}`;
  }

  return `${getBackendOrigin()}/${value.replace(/^\/+/, "")}`;
}

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      (typeof error?.response?.data === "string" ? error.response.data : null) ||
      error?.message ||
      "Une erreur est survenue lors de l'appel API.";

    return Promise.reject(new Error(message));
  }
);

export const apiUploadClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

apiUploadClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      (typeof error?.response?.data === "string" ? error.response.data : null) ||
      error?.message ||
      "Erreur lors de l'upload.";

    return Promise.reject(new Error(message));
  }
);
