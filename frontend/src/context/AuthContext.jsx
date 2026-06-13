import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/api";
import { useSelector, useDispatch } from "react-redux";
import { setValues } from "../redux/spaceSlice";
import { ToastContext } from "./ToastContext";
export const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};


export const AuthProvider = ({ children }) => {
  const {setToastMessage, setColor, setShowToast} = useContext(ToastContext)
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
    console.log("fetch space");

    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const res = await api.get("https://www.curadash.fr/api/spaces/");
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
      const response = await api.post("https://www.curadash.fr/api/login/", {
        email,
        password,
      });
      const { access, refresh } = response.data.tokens;

      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);
      api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
      const res = await api.get("https://www.curadash.fr/api/user/");
      setUser({ ...res.data, isAuthenticated: true });
      setToastMessage("Connexion réussie, bienvenue !"
      );
      setColor("success")
    } catch (error) {
      console.log("Error", error.response.data);
      if (error.response && error.response.data) {
        setColor("danger")
        Object.keys(error.response.data).forEach((field) => {
          const errorMessages = error.response.data[field];
          if (errorMessages && errorMessages.length > 0) {
            setToastMessage(errorMessages[0]);
          } else {
            setToastMessage(
              "Une erreur inconnue s'est produite, veuillez réessayer ultérieurement");
            }
          });
        }
      }
    setShowToast(true)
    setLoading(false);
  };

  const register = async (data) => {
    try {
      const response = await api.post(
        "https://www.curadash.fr/api/register/",
        data,
      );
      const { access } = response.data.tokens;
      localStorage.setItem("accessToken", response.data.tokens.access);
      localStorage.setItem("refreshToken", response.data.tokens.refresh);
      api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
      const res = await api.get("https://www.curadash.fr/api/user/");
      setUser({ ...res.data, isAuthenticated: true });
      setColor("success")
      setToastMessage("Compte crée avec succès, bienvenue !");
    } catch (error) {
      console.error("Register failed:", error);
      if (error.response && error.response.data) {
        setColor("danger")
        Object.keys(error.response.data).forEach((field) => {
          const errorMessages = error.response.data[field];
          if (errorMessages && errorMessages.length > 0) {
            setToastMessage(errorMessages[0]);
          } else {
            setToastMessage("Une erreur inconnue s'est produite, veuillez réessayer ultérieurement");
          }
        });
      }
    }
    setShowToast(true)
    setLoading(false);
  };

  const logout = async (refresh) => {
    if (refresh) {
      try {
        await api.post("https://www.curadash.fr/api/logout/", {
          refresh: refresh,
        });
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        delete api.defaults.headers.common["Authorization"];
        setUser(null);
        setColor("neutral")
        setMessage("Déconnexion");
      } catch (error) {
        console.log(error.response);
        setColor("danger")
        setToastMessage(error.response.data);
      }
      setShowToast(true)

      initAuth();
    }
  };

  const initAuth = async () => {
    console.log("init auth");

    const token = localStorage.getItem("accessToken");

    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      try {
        const res = await api.get("https://www.curadash.fr/api/user/");
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
  }, []);

  useEffect(() => {
    if (space.id === "" || refreshSpace) {
      fetchSpaces();
    }
  }, [user, refreshSpace]);

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

  console.log(loading);
  console.log(space);
  
  

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
