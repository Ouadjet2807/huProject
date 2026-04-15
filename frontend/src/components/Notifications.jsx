import React, { useEffect } from "react";
import { PiPillDuotone } from "react-icons/pi";
import { BsX } from "react-icons/bs";
import { BsXLg } from "react-icons/bs";
import { LuBell } from "react-icons/lu";
import { CiCalendar } from "react-icons/ci";
import api from "../api/api";
import { useNavigate } from "react-router";

export default function Notifications({
  notifications,
  setShow,
  notificationsNotRead,
  setNotificationsNotRead
}) {

  const navigate = useNavigate();

  const readNotifications = async (notification, id) => {

    navigate(notification.object_path);
    if(notification.is_read) return
    if (process.env.NODE_ENV !== "test") {
      try {
        let response = await api.post(
          `http://127.0.0.1:8000/api/read_notification/${notification.id}/`,
        );
        console.log(response);
        setShow(false);
      } catch (error) {
        console.log(error);
      }
    }
      notifications[id].is_read = true
      console.log("reach");
      setNotificationsNotRead(prev => prev-1)
      console.log(notificationsNotRead);

  };


  const renderIcon = (notification) => {
    switch (true) {
      case /s*(traitement)/g.test(notification.message):
        return <PiPillDuotone data-testid="pillIcon"/>
        case /s*(événement)/g.test(notification.message):
        return <CiCalendar data-testid="calendarIcon"/>
      default:
        break;
    }
  };

  return (
    <div data-testid="notificationsComponent" className="notifications-container">
      <div className="header">
        <h4>
          <LuBell /> Notifications {" "}
          {notificationsNotRead > 0 && `(${notificationsNotRead})`}
        </h4>
        <BsXLg data-testid="hideNotificationsButton" style={{ cursor: "pointer" }} onClick={() => setShow(false)} />
      </div>
      <ul>
        {notifications.length > 0 &&
          notifications.map((notification, index) => {
            return (
              <li
                key={`notification_${index}`}
                data-testid="notificationItem"
                className={`${!notification.is_read ? "new" : ""}`}
                onClick={() => readNotifications(notification, index)}
              >
                <h6>
                  {renderIcon(notification)} <span data-testid="notificationTitle">{notification.title.length < 25 ? notification.title : notification.title.slice(0, 25).padEnd(28, "...")}</span>  <small data-testid="time">{new Date(notification.timestamp).toLocaleDateString()}</small>
                </h6>{" "}
                <p>{notification.message}</p>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
