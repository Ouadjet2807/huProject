import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import api, { tokenStore } from "../api/api";

export const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [space, setSpace] = useState({});
  const [refreshSpace, setRefreshSpace] = useState(false);

  const fetchSpaces = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      if (token) {
        const res = await api.get("http://127.0.0.1:8000/api/spaces/");
        setSpace(res.data[0]);
      }
    } catch (err) {
      if (err.response) {
        console.log(err.response.data);
      } else {
        console.log({ detail: "Network error" });
      }
    } finally {
      setRefreshSpace(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post("http://127.0.0.1:8000/api/login/", {
        email,
        password,
      });
      const { access, refresh } = response.data.tokens;

      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);
      api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
      const res = await api.get("http://127.0.0.1:8000/api/user/");
      setUser({ ...res.data, isAuthenticated: true });
    } catch (error) {
      console.error("Login failed:", error);
    }

    setLoading(false);
  };

  const register = async (data) => {
    try {
      const response = await api.post(
        "http://127.0.0.1:8000/api/register/",
        data
      );
      const { access, refresh } = response.data.tokens;
      localStorage.setItem("accessToken", response.data.tokens.access);
      localStorage.setItem("refreshToken", response.data.tokens.refresh);
      api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
      const res = await api.get("http://127.0.0.1:8000/api/user/");
      setUser({ ...res.data, isAuthenticated: true });
    } catch (error) {
      console.error("Register failed:", error);
    }
    setLoading(false);
  };

  const logout = async (refresh) => {
    if (refresh) {
      await api.post("http://127.0.0.1:8000/api/logout/", { refresh: refresh });
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      delete api.defaults.headers.common["Authorization"];
      setUser(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        try {
          const res = await api.get("http://127.0.0.1:8000/api/user/");
          setUser({ ...res.data, isAuthenticated: true });
        } catch (err) {
          console.error("Failed to fetch user info", err);
          logout();
        }
      }

      setLoading(false);
    };
    initAuth();
    fetchSpaces();
  }, []);

  useEffect(() => {
    fetchSpaces();
  }, [refreshSpace]);

  const value = {
    user,
    login,
    logout,
    register,
    loading,
    refreshSpace,
    setRefreshSpace,
    space,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
