import { refreshToken } from "../api/auth.api";
import { jwtDecode } from "jwt-decode";

type Decoded = {
  exp: number;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
let refreshTimeout: any;

export const startTokenAutoRefresh = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return;

  const decoded = jwtDecode<Decoded>(token);

  const expiresAt = decoded.exp * 1000;
  const now = Date.now();

  // refresh 2 minutes before expiry
  const refreshTime = expiresAt - now - 2 * 60 * 1000;

  if (refreshTimeout) clearTimeout(refreshTimeout);

  refreshTimeout = setTimeout(
    async () => {
      try {
        const res = await refreshToken();

        const newToken = res.accessToken;

        if (!newToken) throw new Error("No token");

        localStorage.setItem("accessToken", newToken);

        console.log("🔄 refreshed correctly");

        // restart cycle with new token
        startTokenAutoRefresh();
      } catch (err) {
        console.log("❌ refresh failed", err);

        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      }
    },
    Math.max(refreshTime, 0),
  );
};
