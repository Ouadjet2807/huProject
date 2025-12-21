import React, { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { RiAccountPinCircleLine } from "react-icons/ri";
import { IoHome } from "react-icons/io5";
import { LuLogOut } from "react-icons/lu";
import { CiCalendar } from "react-icons/ci";
import { ToastContext } from "../context/ToastContext";

gsap.registerPlugin(useGSAP); 

export default function Navbar() {
  const { user, logout, message } = useContext(AuthContext);
  const {setMessage, setShowToast, setColor} = useContext(ToastContext)

  const navigate = useNavigate();

  const location = useLocation();

  const [activeNav, setActiveNav] = useState(false);

  const navbar = useRef();

  const auth_routes = [
    {
      name: "Accueil",
      icon: <IoHome />,
      path: "/home",
    },
    {
      name: "Agenda",
      icon: <CiCalendar />,
      path: "/calendar",
    },
    {
      name: "Compte",
      icon: <RiAccountPinCircleLine />,
      path: "/account",
    },
  ];

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

  const handleNavAnimation = (e) => {
    e.stopPropagation();
    if (e.type === "mouseenter") {
      setActiveNav(true);
    } else {
      setActiveNav(false);
    }
  };

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

  useGSAP(() => {

    if(!user) return 
    
    if (activeNav) {
      gsap.to(".App", {
        gridTemplateColumns: "15% 85%",
      });
      gsap.to(".navigation", {
        width: "100%",
        padding: "5px",
      });
      gsap.to(".navigation ul", {
        padding: "15px",
      });
      gsap.to(".navigation ul li", {
        borderRadius: "20px",
        width: "100%",
        padding: "15px 20px",
        textAlign: "left",
        height: "max-content",
        duration: 0.2
      });
      gsap.to(".navigation ul li a, .navigation ul li span", {
        justifyContent: "flex-start",
        duration: 0.2
      });
    } else {
       gsap.to(".App", {
        gridTemplateColumns: "5% 95%",
      });
      gsap.to(".navigation", {
        width: "100%",
      });
      gsap.to(".navigation ul", {
        padding: "10px 5px",
        alignItems: "center",
      });
      gsap.to(".navigation ul li", {
        transition: "0",
        width: "3vw",
        height: "3vw",
        padding: "10px",
        textAlign: "center",
        justifyContent: "center",
        borderRadius: "50%",
      });
       gsap.to(".navigation ul li a, .navigation ul li span", {
        justifyContent: "center",
        duration: 0.2
      });
    }
  }, [activeNav]);

  useEffect(() => {
    if(message.message == '' || message.message === 'Connexion réussie, bienvenue !') return 

    setMessage(message.message)
    setShowToast(true)
    setColor("neutral")
  }, [message])

  console.log(activeNav);
  
  return (
    <nav
      className={`navigation ${user ? "left-tab-nav" : ""}`}
      onMouseEnter={(e) => handleNavAnimation(e)}
      onMouseLeave={(e) => handleNavAnimation(e)}
      ref={navbar}
    >
      <ul className="nav-list">
        {user && (
          <>
            {auth_routes.map((item) => {
              return (
                <li
                  className={`nav-item ${
                    item.path === location.pathname ? "active" : ""
                  }`}
                >
                  <a href={item.path}>{activeNav ? <>{item.icon} {item.name}</> : item.icon}</a>
                </li>
              );
            })}
            <li className="nav-item" onClick={handleLogout}>
              <span>{activeNav ? <><LuLogOut /> Déconnexion</>: <LuLogOut />}</span>
            </li>
          </>
        ) 
          
        }
      </ul>
    </nav>
  );
}
