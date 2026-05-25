import { refreshToken } from "../api/auth.api";

export const startTokenAutoRefresh = () => {
  setInterval(
    async () => {
      try {
        const token = localStorage.getItem("accessToken");

        if (!token) return;

        const res = await refreshToken();

        if (!res.accessToken) return;

        localStorage.setItem("accessToken", res.accessToken);

        console.log("🔄 token refreshed automatically");
      } catch (err) {
        console.log("❌ refresh failed", err);

        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      }
    },
    35 * 60 * 1000,
  ); // every 35 minutes
};
