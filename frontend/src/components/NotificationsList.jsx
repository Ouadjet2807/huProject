import React from "react";
import { PiPillDuotone } from "react-icons/pi";
import { CiCalendar } from "react-icons/ci";
import { useNavigate } from "react-router";
import api from "../api/api";
export default function NotificationsList({
  notifications,
  setNotificationsNotRead,
  fullPage,
  setShow,
}) {
  const navigate = useNavigate();

  const readNotifications = async (notification, id) => {
    navigate(notification.object_path);

    if (!fullPage) {
      setShow(false);
    }

    if (notification.is_read) return;
    if (process.env.NODE_ENV !== "test") {
      try {
        let response = await api.post(
          `http://localhost:8001/api/read_notification/${notification.id}/`,
        );
      } catch (error) {
        console.log(error);
      }
    }
    notifications[id].is_read = true;
    setNotificationsNotRead((prev) => prev - 1);
  };

  const renderIcon = (notification) => {
    switch (true) {
      case /s*(traitement)/g.test(notification.message):
        return <PiPillDuotone data-testid="pillIcon" />;
      case /s*(événement)/g.test(notification.message):
        return <CiCalendar data-testid="calendarIcon" />;
      default:
        break;
    }
  };

  return (
    <ul>
      {notifications &&
        notifications.length > 0 &&
        notifications.map((notification, index) => {
          return (
            <li
              key={`notification_${index}`}
              data-testid="notificationItem"
              className={`${!notification.is_read ? "new" : ""}`}
              onClick={() => readNotifications(notification, index)}
            >
              <h6>
                
                <span data-testid="notificationTitle" className="notification-title">
                  {renderIcon(notification)}{" "}
                  {fullPage || notification.title.length < 25
                    ? notification.title
                    : notification.title.slice(0, 25).padEnd(28, "...")}
                </span>{" "}
                <small data-testid="time">
                  {new Date(notification.timestamp).toLocaleDateString()}
                </small>
              </h6>{" "}
              <p>{notification.message}</p>
            </li>
          );
        })}
    </ul>
  );
}
