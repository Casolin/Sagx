// axios.ts
import axios, { AxiosError } from "axios";
import { refreshToken } from "./auth.api";
import type { InternalAxiosRequestConfig } from "axios";

type QueueItem = {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
};

const api = axios.create({
  baseURL: "",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (config.url?.includes("refresh-token")) {
    return config;
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (error.config?.url?.includes("refresh-token")) {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(error);
      }
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers = originalRequest.headers || {};

          originalRequest.headers.Authorization = `Bearer ${token}`;

          return api(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const res = await refreshToken();

        // IMPORTANT FIX
        const newAccessToken = res.accessToken;

        if (!newAccessToken) {
          throw new Error("No access token returned");
        }

        localStorage.setItem("accessToken", newAccessToken);

        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

        originalRequest.headers = originalRequest.headers || {};

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);

        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);

        console.log("Refresh failed, but NOT logging out immediately");

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
