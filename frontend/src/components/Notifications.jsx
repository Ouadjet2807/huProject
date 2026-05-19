import React, { useEffect, useState } from "react";
import { BsXLg } from "react-icons/bs";
import { LuBell } from "react-icons/lu";
import NotificationsList from "./NotificationsList";
import Button from "react-bootstrap/esm/Button";

export default function Notifications({
  notifications,
  show,
  setShow,
  notificationsNotRead,
  setNotificationsNotRead,
}) {

  return (
    <div data-testid="notificationsComponent" className="notifications-container" style={{pointerEvents: show ? "auto" : "none"}}>
      <div className="header">
        <h4>
          <LuBell /> Notifications {" "}
          {notificationsNotRead > 0 && `(${notificationsNotRead})`}
        </h4>
        <BsXLg data-testid="hideNotificationsButton" style={{ cursor: "pointer" }} onClick={() => setShow(false)} />
      </div>
      <NotificationsList fullPage={false} notifications={notifications} setNotificationsNotRead={setNotificationsNotRead} setShow={setShow}/>
      <Button variant="aqua"><a href="/account/notifications">Voir tout</a></Button>
    </div>
  );
}
