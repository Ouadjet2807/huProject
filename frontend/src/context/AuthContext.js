import React, { createContext, useContext, useState, useEffect } from "react";
import api, { tokenStore } from "../api/api";
import { useSelector, useDispatch } from "react-redux";
import { setValues } from "../redux/spaceSlice";
export const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState({
    status: "",
    message: "",
  });
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const space = useSelector((state) => state.space);

  const [refreshSpace, setRefreshSpace] = useState(false);

  const fetchSpaces = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const res = await api.get("http://127.0.0.1:8000/api/spaces/");
        dispatch(setValues(res.data[0]));
      }
    } catch (err) {
      if (err.response) {
        console.log(err.response.data);
      } else {
        console.log({ detail: "Network error" });
      }
    } finally {
      setRefreshSpace(false);
      setLoading(false);
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
      setMessage({
        status: "success",
        message: "Connexion réussie, bienvenue !",
      });
    } catch (error) {
      console.log("Error", error.response.data);
      if (error.response && error.response.data) {
        Object.keys(error.response.data).forEach((field) => {
          const errorMessages = error.response.data[field];
          if (errorMessages && errorMessages.length > 0) {
            setMessage({
              status: "error",
              message: errorMessages[0],
            });
          } else {
            setMessage({
              status: "error",
              message:
                "Une erreur inconnue s'est produite, veuillez réessayer ultérieurement",
            });
          }
        });
      }
    }

    setLoading(false);
  };

  const register = async (data) => {
    try {
      const response = await api.post(
        "http://127.0.0.1:8000/api/register/",
        data,
      );
      const { access, refresh } = response.data.tokens;
      localStorage.setItem("accessToken", response.data.tokens.access);
      localStorage.setItem("refreshToken", response.data.tokens.refresh);
      api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
      const res = await api.get("http://127.0.0.1:8000/api/user/");
      setUser({ ...res.data, isAuthenticated: true });
      setMessage({
        status: "success",
        message: "Compte crée avec succès, bienvenue !",
      });
    } catch (error) {
      console.error("Register failed:", error);
      if (error.response && error.response.data) {
        Object.keys(error.response.data).forEach((field) => {
          const errorMessages = error.response.data[field];
          if (errorMessages && errorMessages.length > 0) {
            setMessage({
              status: "error",
              message: errorMessages[0],
            });
          } else {
            setMessage({
              status: "error",
              message:
                "Une erreur inconnue s'est produite, veuillez réessayer ultérieurement",
            });
          }
        });
      }
    }
    setLoading(false);
  };

  const logout = async (refresh) => {
    if (refresh) {
      try {
        await api.post("http://127.0.0.1:8000/api/logout/", {
          refresh: refresh,
        });
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        delete api.defaults.headers.common["Authorization"];
        setUser(null);
        setMessage({
          status: "neutral",
          message: "Déconnexion",
        });
      } catch (error) {
        setMessage({
          status: "error",
          message: error.response.data,
        });
      }

      initAuth();
    }
  };

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
    } else if (
      Object.keys(window.location).includes("pathname") &&
      window.location.pathname !== "/login" &&
      !window.location.pathname.includes("invite")
    ) {
      window.location.assign("/login");
    }

    setLoading(false);
  };

  useEffect(() => {
    initAuth();
    fetchSpaces();
  }, []);

  useEffect(() => {
    if (space.id == "" || refreshSpace) {
      fetchSpaces();
    }
  }, [refreshSpace, user]);

  useEffect(() => {}, [space]);
  useEffect(() => {
    if (!loading) {
      initAuth();
    }
  }, [loading]);

  const value = {
    user,
    login,
    logout,
    register,
    loading,
    refreshSpace,
    setRefreshSpace,
    setLoading,
    message,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
