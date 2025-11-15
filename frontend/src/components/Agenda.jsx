import React, { use, useEffect, useState } from "react";
import axios from "axios";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import ModalComponent from "./modals/Modal";
import AddEvent from "./AddEvent";

export default function Agenda({space}) {
  const [agenda, setAgenda] = useState();
  const [agendaItems, setAgendaItems] = useState();
  const [error, setError] = useState();
  const [selectedEvent, setSelectedEvent] = useState({})
  const [show, setShow] = useState(false)
  const [modalContent, setModalContent] = useState({
    id: '',
    title: "",
    body: [],
    footer: []
  })

  const [isLoading, setIsLoading] = useState(false);

  moment.locale("fr");
  const localizer = momentLocalizer(moment);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event)
    setModalContent({
        id: 'event-modal',
        title: event.title,
        body: [event.definition, event.start_date, event.end_date],
        footer: ['cancel', 'edit']
    })
    setShow(true)
  }

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
          setAgendaItems(res.data);
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


  return (
    <div id="agenda">
        
      <ModalComponent content={modalContent} setShow={setShow} show={show}/>

      <AddEvent agenda={agenda} space={space}/>
    
      <Calendar
        localizer={localizer}
        events={agendaItems}
        startAccessor="start_date"
        endAccessor="end_date"
        onSelectEvent={handleSelectEvent}
        style={{ height: 500 }}
      />
    </div>
  );
}
