import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import api from "../api/api";
import Agenda from "./Agenda";
import { IoIosCheckmark } from "react-icons/io";
import { FaUnlockAlt } from "react-icons/fa";

export default function AddEvent({ agenda, space }) {
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    title: "",
    item_type: "random category",
    private: false,
    description: "",
    start_date: "",
    end_date: "",
    created_by: "",
    agenda_id: "",
    participants: [],
    recipients: [],
  });

  const handleChange = (e) => {
    console.log(e);

    if (
      e.target.type == "text" ||
      e.target.type == "date" ||
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
    console.log(formData);
  }, [formData]);

  return (
    <div>
      <form action="" className="add-event">
        <div className="field">
          <label htmlFor="title">Titre de l'événement</label>
          <input
            type="text"
            name="title"
            id=""
            value={formData.title}
            onChange={handleChange}
          />
        </div>
        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea
            name="description"
            id=""
            value={formData.description}
            onChange={handleChange}
          />
        </div>
        <div className="field">
          <label htmlFor="title">Date de début</label>
          <input
            type="date"
            name="start_date"
            id=""
            value={formData.start_date}
            onChange={handleChange}
          />
        </div>
        <div className="field">
          <label htmlFor="title">Date de fin</label>
          <input
            type="date"
            name="end_date"
            id=""
            value={formData.end_date}
            onChange={handleChange}
          />
        </div>
        <div className="field check">
          <label htmlFor="">
            <FaUnlockAlt /> Uniquement visible par moi
          </label>
          <input
            type="checkbox"
            name="private"
            id=""
            checked={formData.private}
            onChange={handleChange}
          />
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
        <input type="submit" value="Create" onClick={handleSubmit} />
      </form>
    </div>
  );
}
