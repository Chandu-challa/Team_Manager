"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { authAPI } from "./api";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const data = await authAPI.me();
          setUser(data);
        }
      } catch (error) {
        if (error?.response?.status === 401) {
          console.log("Session expired or invalid token.");
        } else {
          console.error("Auth check failed", error.message || error);
        }
        localStorage.removeItem("token");
        localStorage.removeItem("refresh");
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (credentials) => {
    const data = await authAPI.login(credentials);
    const user = await authAPI.me();
    setUser(user);
    return data;
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
