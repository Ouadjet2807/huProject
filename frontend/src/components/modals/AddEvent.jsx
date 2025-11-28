import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import api from "../../api/api";
import Agenda from "../Agenda";
import { IoIosCheckmark } from "react-icons/io";
import { FaUnlockAlt } from "react-icons/fa";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

export default function AddEvent({ agenda, show, setShow }) {
  const { user, space } = useContext(AuthContext);

  const [minDate, setMinDate] = useState();
  const defaultStartDate = new Date();
  const defaultEndDate = new Date();
  defaultEndDate.setHours(defaultEndDate.getHours() + 1);

  const [formData, setFormData] = useState({
    title: "",
    item_type: "random category",
    private: false,
    description: "",
    start_date: defaultStartDate.toISOString().slice(0, 19),
    end_date: defaultEndDate.toISOString().slice(0, 19),
    created_by: "",
    agenda_id: "",
    participants: [],
    recipients: [],
  });

  const handleChange = (e) => {
    console.log(e);

    if (
      e.target.type == "text" ||
      e.target.type == "datetime-local" ||
      e.target.type == "textarea"
    ) {
      setFormData((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    } else if (e.target.tagName == "OPTION") {
      const value = parseInt(e.target.value);
      console.log(formData[e.target.parentElement.name]);

      if (!formData[e.target.parentElement.name].includes(value)) {
        setFormData((prev) => ({
          ...prev,
          [e.target.parentElement.name]: [...prev.recipients, value],
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [e.target.parentElement.name]: [
            ...prev.recipients.filter((item) => item !== value),
          ],
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [e.target.name]: e.target.checked,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(
        "http://127.0.0.1:8000/api/agenda_items/",
        formData
      );
      console.log("Success", response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleClose = () => {
    setShow(false);
  };

  useEffect(() => {
    if (
      agenda &&
      Object.keys(agenda).includes("id") &&
      user &&
      Object.keys(user).includes("id")
    ) {
      setFormData((prev) => ({
        ...prev,
        agenda_id: agenda.id,
        created_by: user.id,
        participants: [user.id],
      }));
    }
    if (space && Object.keys(space).includes("caregivers")) {
      space.caregivers.forEach((element) => {
        if (element.user == user.id) {
          setFormData((prev) => ({
            ...prev,
            participants: [element.id],
          }));
        }
      });
    }
  }, [user, agenda, space]);

  console.log(formData.recipients.includes(12));
  useEffect(() => {
    if (formData.start_date) {
      setMinDate(formData.start_date);
    }
  }, [formData]);

  console.log(formData);

  return (
    <Modal show={show} onHide={handleClose} className="add-event-modal">
      <Modal.Header closeButton>
        <Modal.Title>Ajouter un événement</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form action="" className="add-event">
          <input
            type="text"
            name="title"
            id=""
            value={formData.title}
            onChange={handleChange}
            placeholder="Titre de l'événement"
          />
          <textarea
            name="description"
            id=""
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
          />
          <div className="field dates">
            <div className="date-field">
              <label htmlFor="title">Date de début</label>
              <input
                type="datetime-local"
                name="start_date"
                id=""
                value={formData.start_date}
                onChange={handleChange}
              />
            </div>

            <div className="date-field">
              <label htmlFor="title">Date de fin</label>
              <input
                type="datetime-local"
                name="end_date"
                id=""
                min={minDate}
                value={formData.end_date ? formData.end_date : minDate}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="field check">
            <input
              type="checkbox"
              name="private"
              id=""
              checked={formData.private}
              onChange={handleChange}
            />
            <label htmlFor="">
              <FaUnlockAlt /> Uniquement visible par moi
            </label>
          </div>
          {space &&
            Object.keys(space).includes("recipients") &&
            Object.keys(space).includes("caregivers") && (
              <>
                <select
                  name="recipients"
                  id=""
                  onClick={(e) => handleChange(e)}
                  onDoubleClick={(e) => handleChange(e)}
                  multiple
                >
                  <option value="" disabled>
                    Choose a recipients
                  </option>
                  {space.recipients.map((item) => {
                    return (
                      <option
                        value={item.id}
                        style={{
                          background: formData.recipients.includes(item.id)
                            ? "red"
                            : "transparent",
                        }}
                        //   selected={formData.recipients.includes(item.id)}
                      >
                        {item.first_name} {item.last_name}
                      </option>
                    );
                  })}
                </select>
                <select
                  name="participants"
                  id=""
                  onClick={(e) => handleChange(e)}
                  onDoubleClick={(e) => handleChange(e)}
                  multiple
                >
                  <option value="" disabled>
                    Choose a caregiver
                  </option>
                  {space.caregivers.map((item) => {
                    return (
                      <option
                        value={item.id}
                        style={{
                          background: formData.participants.includes(item.id)
                            ? "red"
                            : "transparent",
                        }}
                        //   selected={formData.recipients.includes(item.id)}
                      >
                        {item.first_name} {item.last_name}
                      </option>
                    );
                  })}
                </select>
              </>
            )}
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleSubmit}>Créer</Button>
        <Button variant="secondary" onClick={handleClose}>
          Annuler
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
