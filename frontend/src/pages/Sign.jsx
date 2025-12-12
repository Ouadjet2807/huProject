import React, { useState } from "react";
import Login from "../components/Login";
import Register from "../components/Register";

export default function Sign() {
  const [activeTab, setActiveTab] = useState("login");

  const renderActiveTab = () => {
    switch (activeTab) {
      case "login":
        return <Login />;
      case "register":
        return <Register />;
      default:
        return <Login />;
    }
  };

  return (
    <div id="sign">
      <div className="container">
      <ul className="toolbar">
        <li className={activeTab === "register" ? "active" : ""} onClick={() => setActiveTab("register")}><span>Register</span></li>
        <li className={activeTab === "login" ? "active" : ""} onClick={() => setActiveTab("login")}><span>Login</span></li>
      </ul>
        {renderActiveTab()}
      </div>
    </div>
  );
}
