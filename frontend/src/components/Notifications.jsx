import React, { useEffect } from "react";
import { PiPillDuotone } from "react-icons/pi";
import { BsX } from "react-icons/bs";
import { BsXLg } from "react-icons/bs";
import { LuBell } from "react-icons/lu";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Notifications({
  notifications,
  setShow,
  notificationsNotRead,
}) {
  const navigate = useNavigate();

  const readNotifications = async (notification, id) => {
    navigate(notification.object_path);
    if (!notification.is_read) {
      try {
        let response = await api.post(
          `http://127.0.0.1:8000/api/read_notification/${notification.id}/`,
        );
        console.log(response);
      } catch (error) {
        console.log(error);
      }
      notifications[id].is_read = true
    }

    setShow(false);
  };

  const renderIcon = (notification) => {
    let reg = /s*(traitement)/g;
    if (reg.test(notification.message)) return <PiPillDuotone />;
  };

  useEffect(() => {
    notifications.forEach((notification) => {
      console.log(JSON.parse(notification.reference_item));
    });
  }, [notifications]);

  return (
    <div className="notifications-container">
      <div className="header">
        <h4>
          <LuBell /> Notifications {" "}
          {notificationsNotRead > 0 && `(${notificationsNotRead})`}
        </h4>
        <BsXLg style={{ cursor: "pointer" }} onClick={() => setShow(false)} />
      </div>
      <ul>
        {notifications.length > 0 &&
          notifications.map((notification, index) => {
            return (
              <li
                className={`${!notification.is_read ? "new" : ""}`}
                onClick={() => readNotifications(notification, index)}
              >
                <h6>
                  {renderIcon(notification)} {notification.title}
                </h6>{" "}
                <p>{notification.message}</p>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
