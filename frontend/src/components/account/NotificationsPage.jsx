import React, {useEffect, useState} from 'react'
import NotificationsList from '../NotificationsList';
import Loader from '../Loader';

export default function NotificationsPage({notifications,}) {

  const [unread, setUnread] = useState(0)

  useEffect(() => {
    const filter = notifications.filter(n => !n.is_read)
    setUnread(filter.length)
  }, [notifications])

  return (
    <div data-testid="notificationsComponent">
      <div className="notifications-container full-page">

       <h1>Notifications {unread > 0 && <span>({unread})</span>}</h1>

       {notifications && notifications.length > 0 ?
      <NotificationsList notifications={notifications} fullPage={true}/>

      : 
      <Loader />
    }
      </div>
    </div>
  )
}
