import React, { use, useEffect, useState } from "react";
import axios from "axios";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/fr";
import ModalComponent from "./modals/Modal";
import AddEvent from "./modals/AddEvent";
import Button from "react-bootstrap/esm/Button";
import { LuCalendarPlus } from "react-icons/lu";
import { MdOutlinePermContactCalendar } from "react-icons/md";
import { LuCalendarCheck2 } from "react-icons/lu";

export default function Agenda({ space }) {
  const [agenda, setAgenda] = useState();
  const [agendaItems, setAgendaItems] = useState([]);
  const [todayAgendaItems, setTodayAgendaItems] = useState([]);
  const [error, setError] = useState();
  const [selectedEvent, setSelectedEvent] = useState({});
  const [showEvent, setShowEvent] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [modalContent, setModalContent] = useState({
    id: "",
    title: "",
    body: [],
    footer: [],
  });

  const [isLoading, setIsLoading] = useState(false);

  const today = new Date();

  const date_options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  moment.locale("fr");
  const localizer = momentLocalizer(moment);

  const messages = {
    allDay: "Toute la journée",
    previous: "Précédent",
    next: "Suivant",
    today: "Aujourd'hui",
    month: "Mois",
    week: "Semaine",
    day: "Jour",
    agenda: "Agenda",
    date: "Date",
    time: "Heure",
    event: "Événement",
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setModalContent({
      id: "event-modal",
      title: event.title,
      body: [
        event.definition,
        event.start_date.toISOString(),
        event.end_date.toISOString(),
      ],
      footer: ["cancel", "edit"],
    });
    setShowEvent(true);
  };

  useEffect(() => {
    const fetchAgenda = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("accessToken");

        if (token) {
          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
          const res = await axios.get(
            "http://127.0.0.1:8000/api/agendas/",
            config
          );
          setAgenda(res.data[0]);
        }
      } catch (err) {
        console.error(err);
        if (err.response) {
          setError(err.response.data);
        } else {
          setError({ detail: "Network error" });
        }
      } finally {
        setIsLoading(false);
      }
    };

    const fetchAgendaItems = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("accessToken");

        if (token) {
          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
          const res = await axios.get(
            "http://127.0.0.1:8000/api/agenda_items/",
            config
          );

          res.data.forEach((data) => {
            if (!agendaItems.some((e) => e.id === res.data())) {
              setAgendaItems((prev) => [
                ...prev,
                {
                  agenda: data.agenda,
                  category: data.category,
                  created_at: data.created_at,
                  created_by: data.created_by,
                  description: data.description,
                  end_date: new Date(data.end_date),
                  id: data.id,
                  participants: data.participants,
                  private: data.private,
                  recipients: data.recipients,
                  start_date: new Date(data.start_date),
                  title: data.title,
                },
              ]);
            }
          });
        }
      } catch (err) {
        console.error(err);
        if (err.response) {
          setError(err.response.data);
        } else {
          setError({ detail: "Network error" });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgenda();
    fetchAgendaItems();
  }, []);

  useEffect(() => {
    if (agendaItems.length > 0) {
      let searchTodaysEvent = agendaItems.filter(
        (item) =>
          item.start_date.toLocaleDateString() == today.toLocaleDateString() ||
          item.end_date.toLocaleDateString() == today.toLocaleDateString()
      );
      setTodayAgendaItems(searchTodaysEvent);
    }
  }, [agendaItems]);

  return (
    <div id="agenda">
      <ModalComponent
        content={modalContent}
        setShow={setShowEvent}
        show={showEvent}
      />
      <AddEvent
        agenda={agenda}
        space={space}
        setShow={setShowEventForm}
        show={showEventForm}
      />
      <div className="left-tab">
        <h3>Aujourd'hui</h3>
        <div className="date">{today.toLocaleDateString("fr-Fr", date_options)}</div>
        <div className="todays-events">
          {todayAgendaItems.length > 0 ? (
            <ul>
              {todayAgendaItems.map((event) => {
                return (
                  <li>
                    <div className="icon">
                      <MdOutlinePermContactCalendar />
                    </div>
                    <div className="event-info">
                    <div className="time">
                      {event.start_date.toTimeString().slice(0, 5)}-
                      {event.end_date.toTimeString().slice(0, 5)}
                    </div>
                    <span>{event.title}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="no-events"><LuCalendarCheck2 /> Aucun événement aujourd'hui</p>
          )}
        </div>
        <Button
          className="add-event-btn"
          onClick={() => setShowEventForm(true)}
        >
          <LuCalendarPlus /> Ajouter un événement
        </Button>
      </div>

      <Calendar
        localizer={localizer}
        events={agendaItems}
        startAccessor="start_date"
        endAccessor="end_date"
        onSelectEvent={handleSelectEvent}
        style={{ height: "100%", width: "100%" }}
        messages={messages}
      />
    </div>
  );
}
