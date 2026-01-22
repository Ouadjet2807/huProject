import React, { use, useEffect, useState } from "react";
import axios from "axios";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/fr";
import EventModal from "./modals/EventModal";
import AddEvent from "./modals/AddEvent";
import Button from "react-bootstrap/esm/Button";
import Badge from "react-bootstrap/Badge";
import { LuCalendarPlus } from "react-icons/lu";
import { MdOutlinePermContactCalendar } from "react-icons/md";
import { LuCalendarCheck2 } from "react-icons/lu";
import api from "../api/api";
import Loader from "./Loader";
import { TiArrowBackOutline } from "react-icons/ti";
import { IoLockClosedOutline } from "react-icons/io5";
import ListGroup from "react-bootstrap/ListGroup";

export default function Agenda({ space }) {
  const [agenda, setAgenda] = useState();
  const [agendaItems, setAgendaItems] = useState([]);
  const [eventCategories, setEventCategories] = useState([]);
  const [todayAgendaItems, setTodayAgendaItems] = useState([]);
  const [error, setError] = useState();
  const [selectedEvent, setSelectedEvent] = useState({});
  const [showEvent, setShowEvent] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);

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
    console.log("event", event);

    setSelectedEvent(event);
    // setShowEvent(true);
  };

  const fetchAgenda = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("http://127.0.0.1:8000/api/agendas/");
      setAgenda(res.data[0]);
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
      const res = await api.get("http://127.0.0.1:8000/api/agenda_items/");
      setAgendaItems(res.data);
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

  const fetchCategories = async () => {
    try {
      const res = await api.get(
        "http://127.0.0.1:8000/api/agenda_item_categories/"
      );

      setEventCategories(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const displayDate = (start_date, end_date) => {
    const start = moment(start_date);
    const end = moment(end_date);

    let str = "";

    if (end.diff(start, "days") > 0) {
      str = `${start.local().format("dddd Do MMMM - HH:mm")} | ${end.local().format(
        "dddd, MMMM, YYYY HH:mm:ss"
      )}`;
    } else {
      str = `${start.local().format("dddd Do MMMM - HH:mm")} | ${end.local().format("HH:mm")}`;
    }
    return str;
  };

  useEffect(() => {
    fetchCategories();
    fetchAgenda();
    fetchAgendaItems();
  }, []);

  useEffect(() => {
    if (agendaItems.length > 0) {
      agendaItems.forEach((item) => {
        item.start_date = new Date(item.start_date);
        item.end_date = new Date(item.end_date);
        item.agenda_id = item.agenda.id;
      });
      let searchTodaysEvent = agendaItems.filter(
        (item) =>
          item.start_date.toLocaleDateString() == today.toLocaleDateString() ||
          item.end_date.toLocaleDateString() == today.toLocaleDateString()
      );
      setTodayAgendaItems(searchTodaysEvent);
    }
  }, [agendaItems]);

  useEffect(() => {
    if (!showEvent || !showEventForm) {
      fetchAgendaItems();
    }
  }, [showEvent, showEventForm]);

  console.log(eventCategories);
  console.log(agendaItems);

  return (
    <div id="agenda">
      <AddEvent
        agenda={agenda}
        space={space}
        setShow={setShowEventForm}
        show={showEventForm}
        preloadedEvent={selectedEvent}
      />
      <div className="left-tab">
        {Object.keys(selectedEvent).length > 0 ? (
          <div className="selected-event">
            <Button
              variant="aqua"
              size="sm"
              onClick={() => setSelectedEvent({})}
            >
              <TiArrowBackOutline />
              Retour
            </Button>
            <div className="header">
              <h3>{selectedEvent.title}</h3>
              {!selectedEvent.private && (
                <span className="private-tag">
                  <Badge bg="secondary">
                    <IoLockClosedOutline /> privé
                  </Badge>
                </span>
              )}
            </div>

            <small>
              {displayDate(selectedEvent.start_date, selectedEvent.end_date)}
            </small>

            <div className="description">{selectedEvent.description}</div>

            <ListGroup className="participants">
              {selectedEvent.caregivers.map(item => {
                return <ListGroup.Item>{item.first_name} {item.last_name}</ListGroup.Item>
              })}
            </ListGroup>
            <ListGroup className="recipients">
              {selectedEvent.recipients.map(item => {
                return <ListGroup.Item>{item.first_name} {item.last_name}</ListGroup.Item>
              })}
            </ListGroup>
                <Button
              variant="aqua"
              className="add-event-btn"
              style={{ margin: "0 auto" }}
              onClick={() => setShowEventForm(true)}
            >
              <LuCalendarPlus /> Modifier l'événement
            </Button>
          </div>
        ) : (
          <>
            <h3>Aujourd'hui</h3>
            <div className="date">
              {today.toLocaleDateString("fr-Fr", date_options)}
            </div>
            <div className="todays-events">
              {todayAgendaItems.length > 0 ? (
                <ul>
                  {todayAgendaItems.map((event) => {
                    return (
                      <li onClick={() => handleSelectEvent(event)}>
                        <div
                          className="icon"
                          style={{
                            borderLeftColor:
                              event.category && event.category.color.background,
                          }}
                        >
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
                <p className="no-events">
                  <LuCalendarCheck2 /> Aucun événement aujourd'hui
                </p>
              )}
            </div>
            <Button
              variant="aqua"
              className="add-event-btn"
              style={{ margin: "0 auto" }}
              onClick={() => setShowEventForm(true)}
            >
              <LuCalendarPlus /> Ajouter un événement
            </Button>
          </>
        )}
      </div>
      <div className="right-tab">
        {!isLoading ? (
          <Calendar
            localizer={localizer}
            events={agendaItems}
            eventPropGetter={(event, start, end, isSelected) => {
              let newStyle = {
                backgroundColor: "#92cfbc75",
                color: "#2A534C",
                borderRadius: "5px",
                border: "1px solid #2A534C",
              };

              if (event.category) {
                newStyle.backgroundColor = `${event.category.color.background}`;
                newStyle.border = `1px solid ${event.category.color.text}`;
                newStyle.color = event.category.color.text;
              }

              return {
                className: "",
                style: newStyle,
              };
            }}
            startAccessor="start_date"
            endAccessor="end_date"
            onSelectEvent={handleSelectEvent}
            style={{ height: "100%", width: "100%" }}
            messages={messages}
          />
        ) : (
          <Loader />
        )}
      </div>
    </div>
  );
}
