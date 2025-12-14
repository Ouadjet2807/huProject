import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ToastContext } from "../context/ToastContext";
import Profile from "../components/Profile";
import Space from "../components/Space";

export default function () {
  const { user } = useContext(AuthContext);
  const { setMessage, setColor, setShowToast } = useContext(ToastContext);

  const roles = [
    [1, "administrateur"],
    [2, "éditeur"],
    [3, "lecteur"],
  ];

  const [activeTab, setActiveTab] = useState("profile");
  const [editMode, setEditMode] = useState({
    active: false,
    target: "",
  });

  const renderActiveTab = () => {
    switch (activeTab) {
      case "profile":
        return <Profile editMode={editMode} setEditMode={setEditMode} roles={roles}/>;
      case "space":
        return <Space editMode={editMode} setEditMode={setEditMode} roles={roles}/>;
    }
  };

  return (
    <div id="account">
      <div className="toolbar">
        <ul>
          <li
            className={activeTab === "profile" ? "active" : ""}
            onClick={() => setActiveTab("profile")}
          >
            Votre profil
          </li>
          <li
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
