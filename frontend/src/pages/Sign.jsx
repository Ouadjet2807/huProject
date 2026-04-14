import React, { useContext, useState } from "react";
import Login from "../components/authentification/Login";
import Register from "../components/authentification/Register";
import { AuthContext, AuthProvider } from "../context/AuthContext";
export default function Sign() {
  const [activeTab, setActiveTab] = useState("login");

  const { register, login, message, loading } = useContext(AuthContext);

  const renderActiveTab = () => {
    switch (activeTab) {
      case "login":
        return <Login setActiveTab={setActiveTab} login={login} loading={loading} message={message}/>;
      case "register":
        return <Register setActiveTab={setActiveTab} register={register} loading={loading} message={message}/>;
    }
  };

  return (
    <div id="sign">
      <div className="container">
        <ul className="toolbar">
          <li
            data-testid="registerTab"
            className={activeTab === "register" ? "active" : ""}
            onClick={() => setActiveTab("register")}
          >
            <span>Inscription</span>
          </li>
          <li
            data-testid="loginTab"
            className={activeTab === "login" ? "active" : ""}
            onClick={() => setActiveTab("login")}
          >
            <span>Connexion</span>
          </li>
        </ul>
        {renderActiveTab()}
      </div>
    </div>
  );
}
