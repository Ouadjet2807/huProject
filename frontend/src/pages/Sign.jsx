import React, { useState } from "react";
import Login from "../components/authentification/Login";
import Register from "../components/authentification/Register";

export default function Sign() {
  const [activeTab, setActiveTab] = useState("login");

  const renderActiveTab = () => {
    switch (activeTab) {
      case "login":
        return <Login setActiveTab={setActiveTab}/>;
      case "register":
        return <Register setActiveTab={setActiveTab}/>;
      default:
        return <Login setActiveTab={setActiveTab}/>;
    }
  };

  return (
    <div id="sign">
      <div className="container">
      <ul className="toolbar">
        <li className={activeTab === "register" ? "active" : ""} onClick={() => setActiveTab("register")}><span>Inscription</span></li>
        <li className={activeTab === "login" ? "active" : ""} onClick={() => setActiveTab("login")}><span>Connexion</span></li>
      </ul>
        {renderActiveTab()}
      </div>
    </div>
  );
}
