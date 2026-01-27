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
  const [events, setEvents] = useState([])
  const [todayAgendaItems, setTodayAgendaItems] = useState([]);
  const [error, setError] = useState();
  const [selectedEvent, setSelectedEvent] = useState({});
  const [showEvent, setShowEvent] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

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

  const resetSelectedEvent = () => {
    setSelectedEvent({})
    setIsLoading(true)
  };


  const displayDate = (start_date, end_date) => {
    const start = moment(start_date);
    const end = moment(end_date);

    let str = "";

    if (end.diff(start, "days") > 0) {
      str = `${start.local().format("dddd Do MMMM - HH:mm")} | ${end
        .local()
        .format("dddd, MMMM, YYYY HH:mm:ss")}`;
    } else {
      str = `${start.local().format("dddd Do MMMM - HH:mm")} | ${end.local().format("HH:mm")}`;
    }
    return str;
  };

  useEffect(() => {
    console.log(space);
    if(space && Object.keys(space).length > 0) {
      console.log(space.agenda);
      setAgenda(space.agenda)
      setIsLoading(false)
    }
  }, [space]);

  useEffect(() => {
    if(!agenda && !isLoading) return
  
    if (agenda.items && agenda.items.length > 0) {
      console.log("agenda change");
      agenda.items.forEach((item) => {
        console.log(item);
        console.log(item.category);
        console.log(agenda.categories);

        let find_category = agenda.categories.find(c => c.id == item.category)
        item.category = find_category ? find_category : item.category
        console.log(item);
        item.start_date = new Date(item.start_date);
        item.end_date = new Date(item.end_date);
        item.agenda_id = item.agenda.id;
      });
      let searchTodaysEvent = agenda.items.filter(
        (item) =>
          item.start_date.toLocaleDateString() == today.toLocaleDateString() ||
          item.end_date.toLocaleDateString() == today.toLocaleDateString(),
      );
      setEvents(agenda.items)
      setTodayAgendaItems(searchTodaysEvent);
    }
    setIsLoading(false)
  }, [agenda, isLoading]);


  console.log(todayAgendaItems);
  console.log(events);

  useEffect(() => {
    events.forEach(event => {
      console.log(typeof(event.start_date));
      console.log(typeof(event.end_date));
      
    })
  }, [selectedEvent])


  return (
    <div id="agenda">
      <AddEvent
        agenda={agenda}
        setAgenda={setAgenda}
        space={space}
        setShow={setShowEventForm}
        show={showEventForm}
        preloadedEvent={selectedEvent}
        // fetchAgenda={fetchAgenda}
        setSelectedEvent={setSelectedEvent}
      />
      <div className="left-tab">
        {Object.keys(selectedEvent).length > 0 ? (
          <div className="selected-event">
            <Button
              variant="aqua"
              size="sm"
              onClick={() => resetSelectedEvent()}
            >
              <TiArrowBackOutline />
              Retour
            </Button>
            <div className="header">
              <h3>{selectedEvent.title}</h3>
              {selectedEvent.private && (
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
            {
              selectedEvent.description && selectedEvent.description !== "" ?

              <div className="description">{selectedEvent.description}</div>
              :
              <small>Aucune description</small>
            }
            {selectedEvent.caregivers.length > 0 || selectedEvent.recipients.length > 0 ? <ListGroup className="participants">
              {selectedEvent.caregivers
                .concat(selectedEvent.recipients)
                .map((item) => {
                  return (
                    <ListGroup.Item>
                      {item.first_name} {item.last_name}
                    </ListGroup.Item>
                  );
                })}
            </ListGroup>
          :
          <small>Aucun participant</small>  
          }
          </div>
        ) : (
          <>
            <div className="header">
              <h3>Aujourd'hui</h3>
              <div className="date">
                {today.toLocaleDateString("fr-Fr", date_options)}
              </div>
            </div>
            <div className="todays-events">
              {todayAgendaItems.length > 0 ? (
                <ul>
                  {todayAgendaItems.map((event) => {
                    return (
                      <li onClick={() => setSelectedEvent(event)}>
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
                            {(event.start_date && typeof(event.start_date) !== 'string') && event.start_date.toTimeString().slice(0, 5)}-
                            {(event.end_date && typeof(event.end_date) !== 'string') && event.end_date.toTimeString().slice(0, 5)}
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
          </>
        )}
        <Button
          variant="aqua"
          className="add-event-btn"
          style={{ margin: "0 auto" }}
          onClick={() => setShowEventForm(true)}
        >
          <LuCalendarPlus />{" "}
          {Object.keys(selectedEvent).length > 0 ? "Modifier l'" : "Ajouter un"}{" "}
          événement
        </Button>
      </div>
      <div className="right-tab">
        {!isLoading ? (
          <Calendar
            localizer={localizer}
            events={events}
            eventPropGetter={(event, start, end, isSelected) => {
              let newStyle = {
                backgroundColor: event.category ? event.category.color.background : "#92cfbc75",
                color: event.category ? event.category.color.text : "#2A534C",
                borderRadius: "5px",
                border: event.category ? `1px solid ${event.category.color.text}` : "1px solid #2A534C",
              };

              return {
                className: "",
                style: newStyle,
              };
            }}
            startAccessor="start_date"
            endAccessor="end_date"
            onSelectEvent={setSelectedEvent}
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
