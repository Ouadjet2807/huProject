import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ToastContext } from "../context/ToastContext";
import Profile from "../components/account/Profile";
import Space from "../components/account/Space";
import api from "../api/api";
import Notifications from "../components/Notifications";
import NotificationsPage from "../components/account/NotificationsPage";
import { useNavigate } from "react-router";

export default function Account({ notifications }) {
  const { user } = useContext(AuthContext);
  const { setMessage, setColor, setShowToast } = useContext(ToastContext);

  const roles = [
    [1, "administrateur"],
    [2, "éditeur"],
    [3, "lecteur"],
  ];

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState();
  const [editMode, setEditMode] = useState({
    active: false,
    target: "",
  });

  useEffect(() => {
    const getCaregivers = async () => {
      try {
        let response = await api.get("http://127.0.0.1:8000/api/caregivers");
      } catch (error) {
        console.log(error);
      }
    };

    getCaregivers();
  }, []);

  console.log(notifications);
  

  const renderActiveTab = () => {
    switch (activeTab) {
      case "profile":
        return (
          <Profile
            editMode={editMode}
            setEditMode={setEditMode}
            roles={roles}
          />
        );
      case "space":
        return (
          <Space editMode={editMode} setEditMode={setEditMode} roles={roles} />
        );
      case "notifications":
        return (
          <NotificationsPage notifications={notifications} />
        );
      default:
        return (
          <Profile
            editMode={editMode}
            setEditMode={setEditMode}
            roles={roles}
          />
        );
    }
  };

  useEffect(() => {
    if (!activeTab) return;
    sessionStorage.setItem("tab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    let storage = sessionStorage.getItem("tab");
    console.log(storage);

    if (storage === "") {
      setActiveTab("profile");
      return;
    }

    setActiveTab(storage);
  }, []);

  useEffect(() => {
    console.log(window.location.pathname);

    if (!window.location.pathname) return;
    let pathname = window.location.pathname.replace("/", "").split("/");
    console.log(window.location.pathname);
    console.log(pathname[1]);

    if (pathname.length > 1) {
      console.log("pathname");

      setActiveTab(pathname[1]);
      return;
    }
  }, [window.location.pathname]);

  return (
    <div id="account">
      <div className="toolbar">
        <ul>
          <li
            data-testid="profileTab"
            className={activeTab === "profile" ? "active" : ""}
            onClick={() => navigate("/account/profile")}
          >
            Votre profil
          </li>
          <li
            data-testid="spaceTab"
            className={activeTab === "space" ? "active" : ""}
            onClick={() => navigate("/account/space")}
          >
            Votre espace
          </li>
          <li
            data-testid="notificationsTab"
            className={activeTab === "notifications" ? "active" : ""}
            onClick={() => navigate("/account//notifications")}
          >
            Notifications
          </li>
        </ul>
      </div>
      {renderActiveTab()}
    </div>
  );
}
