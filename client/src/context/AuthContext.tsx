import { useState, useEffect, createContext } from "react";
import type { ReactNode } from "react";
import type { User, AuthContextType } from "../types/global.types";
import { getProfile } from "../api/user.api";
import { login, logout } from "../api/auth.api";
import { useCallStore } from "../utils/call.store";
import { disconnectSocket } from "../services/socket.service";
import { refreshToken } from "../api/auth.api";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

    const retry = async <T,>(
      fn: () => Promise<T>,
      attempts = 6,
      delay = 3000,
    ): Promise<T> => {
      let lastErr: unknown;

      for (let i = 0; i < attempts; i++) {
        try {
          return await fn();
        } catch (err) {
          lastErr = err;
          await wait(delay);
        }
      }

      throw lastErr;
    };

    const initAuth = async () => {
      try {
        const profile = await retry(getProfile, 6, 3000);
        setUser(profile.data);
        return;
      } catch (err) {
        console.log(err);
      }

      try {
        const res = await retry(refreshToken, 3, 3000);

        if (!res?.accessToken) throw new Error("No access token");

        localStorage.setItem("accessToken", res.accessToken);

        const profile = await retry(getProfile, 6, 3000);
        setUser(profile.data);
        return;
      } catch {
        setUser(null);
        localStorage.removeItem("accessToken");
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const loginUser = async (data: { email: string; password: string }) => {
    const res = await login(data);

    const accessToken = res?.accessToken || res?.data?.accessToken;
    const userData = res?.user || res?.data?.user;

    if (!accessToken) {
      throw new Error("No access token returned");
    }

    localStorage.setItem("accessToken", accessToken);

    try {
      const profile = await getProfile();
      setUser(profile.data);
    } catch {
      setUser(userData || null);
    }
  };

  const logoutUser = async () => {
    try {
      useCallStore.getState().endCall();
      disconnectSocket();
      await logout();
    } catch (err) {
      console.error(err);
    } finally {
      setUser(null);
      localStorage.removeItem("accessToken");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
