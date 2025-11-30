import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import api from "../../api/api";
import Agenda from "../Agenda";
import { IoIosCheckmark } from "react-icons/io";
import { IoLockClosedOutline } from "react-icons/io5";
import { IoLockOpenOutline } from "react-icons/io5";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Dropdown from "react-bootstrap/Dropdown";
import moment from "moment";
import "moment/locale/fr";
import { FaTag } from "react-icons/fa6";
import { CiShoppingTag } from "react-icons/ci";
import CreateCategory from "./CreateCategory";
import { FaRegTrashAlt } from "react-icons/fa";

export default function AddEvent({ agenda, show, setShow }) {
  moment.locale("fr");
  const { user, space } = useContext(AuthContext);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState();
  const [minDate, setMinDate] = useState();
  const [showCreateCategory, setShowCreateCategory] = useState(false);

  let today = new Date();

  let default_start_date = `${moment().local().toISOString().slice(0, 10)} ${
    moment().hours() < 10 ? `0${moment().hours()}:00` : `${moment().hours()}:00`
  }`;

  let default_end_date = `${moment().local().toISOString().slice(0, 10)} ${
    moment().add(1, "hours").hours() < 10
      ? `0${moment().add(1, "hours").hours()}:00`
      : `${moment().add(1, "hours").hours()}:00`
  }`;

  console.log(default_start_date);

  const [formData, setFormData] = useState({
    title: "",
    item_type: "random category",
    private: false,
    category: "",
    description: "",
    start_date: default_start_date,
    end_date: default_end_date,
    created_by: "",
    agenda_id: "",
    participants: [],
    recipients: [],
  });

  console.log(formData);
  const fetchCategory = async () => {
    try {
      const res = await api.get(
        "http://127.0.0.1:8000/api/agenda_item_categories/"
      );
      console.log("Success ", res.data);
      setCategories(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    // handling different input types
    if (e.target.type == "text" || e.target.type == "textarea") {
      setFormData((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    } else if (e.target.tagName == "OPTION") {
      const value = parseInt(e.target.value);
      console.log(e.target);

      if (
        !formData[e.target.parentElement.name].includes(value) &&
        e.target.selected
      ) {
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
    } else if (e.target.type == "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [e.target.name]: e.target.checked,
      }));
    } else if (e.target.type == "time" || e.target.type == "date") {
      let key = e.target.name.split("_")[0] + "_date";

      setFormData((prev) => ({
        ...prev,
        [key]: { ...prev[key], [e.target.type]: e.target.value },
      }));
    }
  };

  const selectCategory = (category) => {
    setFormData((prev) => ({
      ...prev,
      category: category.id,
    }));

    setSelectedCategory(category);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(formData);

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

  const handleDelete = async (e, id) => {
    e.stopPropagation();

    if (!id) return;

    let filter = categories.filter((item) => item.id !== id);
    setCategories(filter);

    try {
      await api.delete(
        `http://127.0.0.1:8000/api/agenda_item_categories/${id}`
      );
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

  useEffect(() => {
    if (formData.start_date) {
      let end_date = moment(formData.start_date.slice(0, 10)).local();
      let end_time = moment(formData.start_date).add(1, "hours").hours();

      setFormData((prev) => ({
        ...prev,
        end_date: `${end_date.toISOString().slice(0, 10)} ${
          end_time < 10 ? `0${end_time}:00` : `${end_time}:00`
        }`,
      }));
    }
  }, [formData.start_date]);

  useEffect(() => {
    fetchCategory();
  }, []);

  useEffect(() => {
    if (!showCreateCategory) {
      fetchCategory();
    }
  }, [showCreateCategory]);

  return (
    <>
      <CreateCategory
        show={showCreateCategory}
        setShow={setShowCreateCategory}
        agenda={agenda}
      />
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

            <Dropdown className="categories-dropdown">
              <Dropdown.Toggle id="dropdown-basic">
                {selectedCategory ? (
                  <>
                    <div className="label">
                      <CiShoppingTag
                        style={{ color: selectedCategory.color }}
                      />{" "}
                      {selectedCategory.name}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="label">
                      <CiShoppingTag /> Catégorie
                    </div>
                  </>
                )}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {categories.length > 0 &&
                  categories.map((category) => {
                    return (
                      <Dropdown.Item
                        onClick={() => {
                          selectCategory(category);
                        }}
                      >
                        <div className="tag">
                          <FaTag style={{ color: category.color }} />
                          {category.name}
                        </div>
                        <div
                          className="delete"
                          onClick={(e) => handleDelete(e, category.id)}
                        >
                          <FaRegTrashAlt />
                        </div>
                      </Dropdown.Item>
                    );
                  })}
                <Dropdown.Divider />
                <Dropdown.Item onClick={() => setShowCreateCategory(true)}>
                  Nouvelle catégorie
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <div className="field dates">
              <div className="date-field">
                <label htmlFor="title">Date</label>
                <input
                  type="date"
                  name="start_date"
                  id=""
                  value={formData.start_date.slice(0, 10)}
                  onChange={handleChange}
                />
              </div>

              <div className="time-field">
                <input
                  type="time"
                  name="start_hour"
                  id=""
                  min={default_start_date.slice(11, 16)}
                  value={formData.start_date.slice(11, 16)}
                  onChange={handleChange}
                />
                <input
                  type="time"
                  name="end_hour"
                  id=""
                  min={formData.start_date.slice(11, 16)}
                  value={formData.end_date.slice(11, 16)}
                  onChange={handleChange}
                />
              </div>
            </div>
            {space &&
              Object.keys(space).includes("recipients") &&
              Object.keys(space).includes("caregivers") && (
                <div className="participants">
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
                          className={`${
                            formData.recipients.includes(item.id)
                              ? "selected"
                              : ""
                          }`}
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
                      Participants
                    </option>
                    {space.caregivers.map((item) => {
                      return (
                        <option
                          value={item.id}
                          className={`${
                            formData.participants.includes(item.id)
                              ? "selected"
                              : ""
                          }`}
                        >
                          {item.first_name} {item.last_name}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}
            <div
              className={`field ${formData.private ? "checked" : ""}`}
              id="private"
            >
              <input
                type="checkbox"
                name="private"
                id=""
                checked={formData.private}
                onChange={handleChange}
              />
              <label htmlFor="">
                {formData.private ? (
                  <IoLockClosedOutline />
                ) : (
                  <IoLockOpenOutline />
                )}{" "}
                Privé
              </label>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleSubmit}>Créer</Button>
          <Button variant="secondary" onClick={handleClose}>
            Annuler
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
