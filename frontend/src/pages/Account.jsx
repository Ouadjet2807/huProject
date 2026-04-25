import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ToastContext } from "../context/ToastContext";
import Profile from "../components/account/Profile";
import Space from "../components/account/Space";
import api from "../api/api";

export default function Account() {
  const { user } = useContext(AuthContext);
  const { setMessage, setColor, setShowToast } = useContext(ToastContext);

  const roles = [
    [1, "administrateur"],
    [2, "éditeur"],
    [3, "lecteur"],
  ];

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
    }
  };

  useEffect(() => {
    if (!activeTab) return;
    sessionStorage.setItem("tab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (!window.location.pathname) return;
    let pathname = window.location.pathname.replace("/", "").split("/");
    console.log(window.pathname);

    if (pathname.length > 1) {
      setActiveTab(pathname[1]);
      return;
    }

    let storage = sessionStorage.getItem("tab");

    if (storage === "") {
      setActiveTab("profile");
      return;
    }

    setActiveTab(storage);
  }, []);

  return (
    <div id="account">
      <div className="toolbar">
        <ul>
          <li
            data-testid="profileTab"
            className={activeTab === "profile" ? "active" : ""}
            onClick={() => setActiveTab("profile")}
          >
            Votre profil
          </li>
          <li
            data-testid="spaceTab"
            className={activeTab === "space" ? "active" : ""}
            onClick={() => setActiveTab("space")}
          >
            Votre espace
          </li>
        </ul>
      </div>
      {renderActiveTab()}
    </div>
  );
}
