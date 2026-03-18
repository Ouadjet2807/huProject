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
import { LuUsersRound } from "react-icons/lu";
import { HiOutlineBars3BottomLeft } from "react-icons/hi2";
import { useSelector } from "react-redux";
import { BsFilter } from "react-icons/bs";
import Dropdown from "react-bootstrap/Dropdown";
import Form from 'react-bootstrap/Form';
import { PiTagDuotone } from "react-icons/pi";

export default function Agenda() {
  const [agenda, setAgenda] = useState({});
  const [events, setEvents] = useState([]);
  const [todayAgendaItems, setTodayAgendaItems] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState({});
  const [showEventForm, setShowEventForm] = useState(false);
  const space = useSelector((state) => state.space);
  const [isLoading, setIsLoading] = useState(true);
  const [hiddenCategories, setHiddenCategories] = useState([])

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
    setSelectedEvent({});
    setIsLoading(true);
  };

  const filterCategory = (e, category) => {
    if(e.target.checked && hiddenCategories.includes(category)) {
      let filter = hiddenCategories.filter(hiddenCat => hiddenCat !== category) 
      setHiddenCategories(filter)
    } else {
      setHiddenCategories(prev => [...prev, category])
    }
  }

  const displayDate = (start_date, end_date) => {
    const start = moment(start_date);
    const end = moment(end_date);

    let str = "";

    if (end.diff(start, "days") > 0) {
      str = `Du ${start.local().format("dddd Do MMMM - HH:mm")} au ${end
        .local()
        .format("dddd Do, MMMM, YYYY HH:mm:ss")}`;
    } else {
      str = `${start.local().format("dddd Do MMMM - HH:mm")} | ${end.local().format("HH:mm")}`;
    }
    return str;
  };

  useEffect(() => {
    console.log(space);
    if (space && Object.keys(space).length > 0) {
      console.log(space.agenda);
      setAgenda(space.agenda);
    }
  }, [space]);

  useEffect(() => {
    if (!agenda) return;
    console.log("formatting");
    
    // Format event
    if (Object.keys(agenda).includes("items") && agenda.items.length > 0) {
      let formatted_events = JSON.stringify(agenda.items);
      formatted_events = JSON.parse(formatted_events);
      formatted_events.forEach((item) => {
        let find_category = agenda.categories.find(
          (c) => c.id == item.category,
        );
        console.log(item.category);
        console.log(find_category);
        item.category = find_category ? find_category : item.category;
        console.log(item);
        item.start_date = new Date(item.start_date);
        item.end_date = new Date(item.end_date);
        item.agenda_id = item.agenda.id;
      });
      let searchTodaysEvent = formatted_events.filter(
        (item) =>
          item.start_date.toLocaleDateString() === today.toLocaleDateString() ||
          item.end_date.toLocaleDateString() === today.toLocaleDateString(),
      );

      setEvents(formatted_events.filter(event => !hiddenCategories.includes(event.category && event.category.id)));
      setTodayAgendaItems(searchTodaysEvent);
      setIsLoading(false);
    }
  }, [agenda, isLoading, hiddenCategories]);


  console.log(todayAgendaItems);
  console.log(agenda);
  console.log(isLoading);
  console.log(events);
  
  console.log(hiddenCategories);
  

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
            {selectedEvent.description && selectedEvent.description !== "" ? (
              <div className="description">{selectedEvent.description}</div>
            ) : (
              <small>
                <HiOutlineBars3BottomLeft /> Aucune description
              </small>
            )}
            {selectedEvent.caregivers.length > 0 ||
            selectedEvent.recipients.length > 0 ? (
              <ListGroup className="participants">
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
            ) : (
              <small>
                <LuUsersRound /> Aucun participant
              </small>
            )}
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
              {isLoading ? (
                <Loader />
              ) : todayAgendaItems.length > 0 ? (
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
                            {event.start_date &&
                              typeof event.start_date !== "string" &&
                              event.start_date.toTimeString().slice(0, 5)}
                            -
                            {event.end_date &&
                              typeof event.end_date !== "string" &&
                              event.end_date.toTimeString().slice(0, 5)}
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
        {isLoading && <Loader overlay={true} />}
        <Dropdown autoClose={false}>
          <Dropdown.Toggle variant="" id="dropdown-basic" className="filter">
            <BsFilter />
          </Dropdown.Toggle>

          <Dropdown.Menu >
            <Dropdown.Header>Filtrer</Dropdown.Header>
            {(agenda.categories && agenda.categories.length > 0) &&
              agenda.categories.map((category) => {
                return <Dropdown.Item><Form.Check type="checkbox" checked={!hiddenCategories.includes(category.id)} name={`${category.name}_category`} onChange={(e) => filterCategory(e, category.id)} id=""/> <PiTagDuotone  style={{ color: category.color.text }}/> {category.name}</Dropdown.Item>
              })}
          </Dropdown.Menu>
        </Dropdown>

        <Calendar
          localizer={localizer}
          events={events}
          eventPropGetter={(event, start, end, isSelected) => {
            let newStyle = {
              backgroundColor: event.category
                ? event.category.color.background
                : "#92cfbc75",
              color: event.category ? event.category.color.text : "#2A534C",
              borderRadius: "5px",
              border: event.category
                ? `1px solid ${event.category.color.text}`
                : "1px solid #2A534C",
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
      </div>
    </div>
  );
}
