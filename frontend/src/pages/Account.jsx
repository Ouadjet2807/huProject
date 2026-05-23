import { useEffect, useState } from "react";
import Profile from "../components/account/Profile";
import Space from "../components/account/Space";

export default function Account() {

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
