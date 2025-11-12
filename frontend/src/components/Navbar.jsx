import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function Navbar() {

  const { user, logout } = useContext(AuthContext);

  const navigate = useNavigate()

  const location = useLocation()

  const [active, setActive] = useState()

  const auth_routes = [
     {
      name: "Home",
      path: "/home",
    },
    {
      name: "Logout",
      path: "/logout",
    },
  ]


  const no_auth_routes = [
    {
      name: "Register",
      path: "/register",
    },
    {
      name: "Login",
      path: "/login",
    },
  ];

  

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      logout(refreshToken);

      console.log(refreshToken);
    } catch (error) {
      console.log(error);
    } finally {
      navigate("/login");
    }
  };

  
  return (

      <nav className="navigation">
        <ul className="nav-list">
          {user ? (
            auth_routes.map((item) => {
              return (
                <li className={`nav-item ${item.path === location.pathname ? 'active' : ''}`}>
                  <a href={item.path}>{item.name}</a>
                </li>
              );
            })
          ) : (
            no_auth_routes.map((item) => {
              return (
                <li className={`nav-item ${item.path === location.pathname ? 'active' : ''}`}>
                  <a href={item.path}>{item.name}</a>
                </li>
              );
            })
          )}
        </ul>
      </nav>

  );
}
