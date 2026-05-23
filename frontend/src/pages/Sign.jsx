import React, { useContext, useState } from "react";
import Login from "../components/authentification/Login";
import Register from "../components/authentification/Register";
import { AuthContext } from "../context/AuthContext";
export default function Sign({inviteData, token}) {
  const [activeTab, setActiveTab] = useState("register");

  const { register, login, message, loading } = useContext(AuthContext);

  const renderActiveTab = () => {
    switch (activeTab) {
      case "login":
        return <Login data={inviteData ? inviteData : null} token={token ? token : null} setActiveTab={setActiveTab} login={login} loading={loading} message={message}/>;
      case "register":
        return <Register data={inviteData ? token : null} token={token ? token : null} setActiveTab={setActiveTab} register={register} loading={loading} message={message}/>;
      default:
        <Login data={inviteData ? inviteData : null} token={token ? token : null} setActiveTab={setActiveTab} login={login} loading={loading} message={message}/>
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
