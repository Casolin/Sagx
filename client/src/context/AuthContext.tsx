import { useState, useEffect, createContext } from "react";
import type { ReactNode } from "react";
import type { User, AuthContextType } from "../types/global.types";
import { getProfile } from "../api/user.api";
import { login, logout } from "../api/auth.api";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const profile = await getProfile();
        setUser(profile.data);
      } catch (err) {
        console.error("Auth bootstrap failed:", err);
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
