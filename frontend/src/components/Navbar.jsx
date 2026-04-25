import React, { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { useLocation, useNavigate, useParams } from "react-router";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { RiAccountPinCircleLine } from "react-icons/ri";
import { IoHome } from "react-icons/io5";
import { LuLogOut } from "react-icons/lu";
import { CiCalendar } from "react-icons/ci";
import { ToastContext } from "../context/ToastContext";
import { BsPinFill } from "react-icons/bs";
import { BsPin } from "react-icons/bs";
import { LuBell } from "react-icons/lu";
import Badge from "react-bootstrap/Badge";
import Notifications from "./Notifications";
import { UseDimensionsContext } from "../context/UseDimensionsContext";

gsap.registerPlugin(useGSAP);

export default function Navbar({ notifications, user, logout, message }) {
  const { setToastMessage, setShowToast, setColor } = useContext(ToastContext);

  const navigate = useNavigate();

  const { width } = useContext(UseDimensionsContext);

  const location = useLocation();
  const [notificationsNotRead, setNotificationsNotRead] = useState(0);
  const [activeNav, setActiveNav] = useState(false);
  const [pinNav, setPinNav] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileNavActive, setMobileNavActive] = useState(false);

  const navbar = useRef();

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

  const handleNavAnimation = async (e) => {
    if (pinNav || width < 800) return;
    e.stopPropagation();
    await sleep(500);
    setActiveNav(!activeNav);
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      logout(refreshToken);
    } catch (error) {
      console.log(error);
    } finally {
      navigate("/login");
    }
  };

  useGSAP(() => {
    if (!user || width < 800) return;

    if (activeNav) {
      gsap.to(".App", {
        gridTemplateColumns: "15% 85%",
      });
      gsap.to("nav", {
        width: "100%",
        padding: "5px",
      });
      gsap.to("nav .pin", {
        opacity: 1,
      });
      gsap.to("nav .nav-list", {
        padding: "15px",
      });
      gsap.to("nav .nav-list li", {
        borderRadius: "20px",
        width: "100%",
        padding: "15px 20px",
        textAlign: "left",
        height: "max-content",
        duration: 0.2,
      });
      gsap.to("nav .nav-list li a, .navigation .nav-list li span", {
        justifyContent: "flex-start",
        duration: 0.2,
      });
      gsap.to("nav .nav-list li span h6", {
        top: "5%",
        left: "15%",
        duration: 0.2,
      });
    } else {
      gsap.to(".App", {
        gridTemplateColumns: "5% 95%",
      });
      gsap.to("nav", {
        width: "100%",
      });
      gsap.to("nav .pin", {
        opacity: 0,
      });
      gsap.to("nav .nav-list", {
        padding: "10px 5px",
        alignItems: "center",
      });
      gsap.to("nav .nav-list li", {
        transition: "0",
        width: "3vw",
        height: "3vw",
        padding: "10px",
        textAlign: "center",
        justifyContent: "center",
        borderRadius: "50%",
      });
      gsap.to("nav .nav-list li a, .navigation .nav-list li span", {
        justifyContent: "center",
        duration: 0.2,
      });
      gsap.to("nav .nav-list li span h6", {
        left: "45%",
        duration: 0.2,
      });
    }
  }, [activeNav]);

  useGSAP(() => {
    if (showNotifications) {
      gsap.to(".notifications-container .header, .notifications-container ul", {
        display: "flex",
        opacity: 1,
        duration: 0.3,
      });
      gsap.to(".notifications-container", {
        width: "25vw",
        padding: "20px",
        duration: 0.1,
      });
    } else {
      gsap.to(".notifications-container .header, .notifications-container ul", {
        display: "none",
        opacity: 0,
        duration: 0.1,
      });
      gsap.to(".notifications-container", {
        width: "0vw",
        padding: 0,
        duration: 0.3,
      });
    }
  }, [showNotifications]);

  useEffect(() => {
    if (
      !message ||
      message.message === "" ||
      message.message === "Connexion réussie, bienvenue !"
    )
      return;

    setToastMessage(message.message);
    setShowToast(true);
    setColor("neutral");
  }, [message]);

  useEffect(() => {
    if (!notifications || notifications.length <= 0) return;

    let findNotReadNotifications = notifications.filter((n) => !n.is_read);

    setNotificationsNotRead(findNotReadNotifications.length);
  }, [notifications]);

  return (
    <div className="navbar-container">
      <nav
        data-testid="navigation"
        className={`navigation ${user ? "left-tab-nav" : ""} ${width < 800 ? "mobile-nav" : ""} ${mobileNavActive ? "active" : ""}`}
        onMouseEnter={(e) => handleNavAnimation(e)}
        onMouseLeave={(e) => handleNavAnimation(e)}
        ref={navbar}
      >
        {user && (
          <>
            {width > 800 ? (
              <>
                <div
                  data-testid="navPin"
                  className={`pin ${pinNav ? "active" : ""}`}
                  onClick={() => setPinNav(!pinNav)}
                >
                  {pinNav ? <BsPinFill /> : <BsPin />}
                </div>
                <ul className="nav-list">
                  {auth_routes.map((item, index) => {
                    return (
                      <li
                        key={`nav_item_${index}`}
                        className={`nav-item ${
                          item.path === location.pathname ? "active" : ""
                        }`}
                      >
                        <a href={item.path}>
                          {activeNav ? (
                            <>
                              {item.icon}{" "}
                              <span data-testid="navItemText">{item.name}</span>
                            </>
                          ) : (
                            item.icon
                          )}
                        </a>
                      </li>
                    );
                  })}
                  <li
                    data-testid="showNotificationsButton"
                    className="nav-item"
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    <span>
                      {notificationsNotRead > 0 && (
                        <h6 data-testid="notificationsPill">
                          <Badge bg="danger">{notificationsNotRead}</Badge>
                        </h6>
                      )}
                      {activeNav ? (
                        <>
                          <LuBell />{" "}
                          <span data-testid="navItemText">Notifications</span>
                        </>
                      ) : (
                        <LuBell />
                      )}
                    </span>
                  </li>
                  <li className="nav-item" onClick={handleLogout}>
                    <span>
                      {activeNav ? (
                        <>
                          <LuLogOut />{" "}
                          <span data-testid="navItemText">Déconnexion</span>
                        </>
                      ) : (
                        <LuLogOut />
                      )}
                    </span>
                  </li>
                </ul>
              </>
            ) : (
              <>
                <div
                  className="burger-nav"
                  onClick={() => setMobileNavActive(!mobileNavActive)}
                >
                  <span></span>
                  <span></span>
                </div>
                <ul className="nav-list">
                  {auth_routes.map((item, index) => {
                    return (
                      <li
                        key={`nav_item_${index}`}
                        className={`nav-item ${
                          item.path === location.pathname ? "active" : ""
                        }`}
                      >
                        <a href={item.path}>
                          {item.icon}{" "}
                          <span data-testid="navItemText">{item.name}</span>
                        </a>
                      </li>
                    );
                  })}
                  <li
                    data-testid="showNotificationsButton"
                    className="nav-item"
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    <span>
                      {notificationsNotRead > 0 && (
                        <h6 data-testid="notificationsPill">
                          <Badge bg="danger">{notificationsNotRead}</Badge>
                        </h6>
                      )}

                      <>
                        <LuBell />{" "}
                        <span data-testid="navItemText">Notifications</span>
                      </>
                    </span>
                  </li>
                  <li className="nav-item" onClick={handleLogout}>
                    <span>
                      <LuLogOut />{" "}
                      <span data-testid="navItemText">Déconnexion</span>
                    </span>
                  </li>
                </ul>
              </>
            )}
          </>
        )}
      </nav>
      <Notifications
        notifications={notifications}
        notificationsNotRead={notificationsNotRead}
        setNotificationsNotRead={setNotificationsNotRead}
        setShow={setShowNotifications}
      />
    </div>
  );
}
