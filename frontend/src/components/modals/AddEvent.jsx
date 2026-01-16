import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import api from "../../api/api";
import Agenda from "../Agenda";
import { IoIosCheckmark } from "react-icons/io";
import { IoLockClosedOutline } from "react-icons/io5";
import { IoLockOpenOutline } from "react-icons/io5";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Dropdown from "react-bootstrap/Dropdown";
import moment from "moment";
import "moment/locale/fr";
import { PiTagDuotone } from "react-icons/pi";
import CreateCategory from "./CreateCategory";
import { FaRegTrashAlt } from "react-icons/fa";
import { ToastContext } from "../../context/ToastContext";
import ListGroup from "react-bootstrap/ListGroup";
import FloatingLabel from "react-bootstrap/FloatingLabel";

export default function AddEvent({ agenda, show, setShow, preloadedEvent }) {
  moment.locale("fr");
  const { user, space } = useContext(AuthContext);

  const { setShowToast, setMessage, setColor } = useContext(ToastContext);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState();
  const [showCreateCategory, setShowCreateCategory] = useState(false);

  let default_start_date = moment()
    .minutes(0)
    .seconds(0)
    .seconds(0)
    .local()
    .format();

  let default_end_date = moment()
    .add(1, "hours")
    .minutes(0)
    .seconds(0)
    .seconds(0)
    .local()
    .format();

  const [formData, setFormData] = useState({
    title: "",
    item_type: "random category",
    private: false,
    category: "",
    description: "",
    start_date: default_start_date,
    end_date: default_end_date,
    created_by: {},
    created_by_id: "",
    agenda_id: "",
    agenda: {},
    participants: [],
    recipients: [],
  });


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
    let key = [e.target.name];
    let value = "";
    if (e.target.type == "text" || e.target.type == "textarea") {
      value = e.target.value;
    } else if (e.target.type === "checkbox") {
      console.log(e.target.value);
      const parsed_value = JSON.parse(e.target.value);
      if (
        e.target.checked &&
        !formData[key].some((e) => e.id == parsed_value.id)
      ) {
        formData[key].push(parsed_value);
        value = formData[key];
      } else {
        console.log("uncheck");
        value = formData[key].filter((item) => item.id !== parsed_value.id);
      }
    } else if (e.target.type == "time" || e.target.type == "date") {
      key = e.target.name.split("_")[0] + "_date";
      value =
        e.target.type == "time"
          ? `${formData[key].slice(0, 10)} ${e.target.value}`
          : `${e.target.value} ${formData[key].slice(11, 16)}`;
    }
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const selectCategory = (category) => {
    setFormData((prev) => ({
      ...prev,
      category: category,
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
      setShowToast(true);
      setMessage("Événement crée avec succès");
      setColor("success");
      handleClose();
    } catch (error) {
      console.log(error);
      setShowToast(true);
      setMessage(
        "Une erreur s'est produite lors de la création de l'événement"
      );
      setColor("danger");
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
    setFormData({
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
        agenda: agenda,
        agenda_id: agenda.id,
        created_by_id: user.id,
        created_by: user,
        participants: [user],
      }));
    }
    if (space && Object.keys(space).includes("caregivers")) {
      space.caregivers.forEach((element) => {
        if (user && element.user == user.id) {
          setFormData((prev) => ({
            ...prev,
            participants: [element],
          }));
        }
      });
    }
  }, [user, agenda, space]);

  useEffect(() => {
    if (formData.start_date) {
      let start_date = moment(formData.start_date);

      setFormData((prev) => ({
        ...prev,
        end_date: start_date.add(1, "hours").format(),
      }));
    }
  }, [formData.start_date]);

  useEffect(() => {
    if (!showCreateCategory) {
      fetchCategory();
    }
  }, [showCreateCategory]);

  useEffect(() => {
    if (Object.keys(preloadedEvent).length <= 0) return;
    console.log(preloadedEvent);
    preloadedEvent.start_date = moment(preloadedEvent.start_date).format();
    preloadedEvent.end_date = moment(preloadedEvent.end_date).format();
    setFormData(preloadedEvent);
    console.log(preloadedEvent);
  }, [preloadedEvent]);

  useEffect(() => {
    fetchCategory();
  }, []);

  console.log(formData);

  return (
    <>
      <CreateCategory
        show={showCreateCategory}
        setShow={setShowCreateCategory}
        agenda={agenda}
      />
      <Modal
        size="lg"
        show={show}
        onHide={handleClose}
        className="add-event-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Ajouter un événement</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form action="" className="add-event">
            <FloatingLabel
              controlId="floatingInput"
              label="Titre de l'événement"
              className=""
            >
              <Form.Control
                type="text"
                name="title"
                id=""
                value={formData.title}
                onChange={handleChange}
              />
            </FloatingLabel>
            <FloatingLabel
              controlId="floatingInput"
              label="Description"
              className=""
            >
              <Form.Control
                as="textarea"
                name="description"
                rows={3}
                onChange={handleChange}
                value={formData.description}
              />
            </FloatingLabel>

            <Dropdown className="categories-dropdown">
              <Dropdown.Toggle id="dropdown-basic">
                {selectedCategory ? (
                  <>
                    <div className="label">
                      <PiTagDuotone
                        style={{ color: selectedCategory.color.text, transform: "rotateZ(180deg)"}}
                      />
                      {selectedCategory.name}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="label">
                      <PiTagDuotone /> Catégorie
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
                          <PiTagDuotone style={{ color: category.color.background }} />
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
            <div className="lists">
              <ListGroup className="recipients">
                {Object.keys(space).length > 0 &&
                  space.recipients.map((item) => {
                    return (
                      <ListGroup.Item>
                        <Form.Check
                          inline
                          value={JSON.stringify(item)}
                          checked={
                            formData.recipients &&
                            formData.recipients.some((e) => e.id == item.id)
                          }
                          name="recipients"
                          label={`${item.first_name} ${item.last_name}`}
                          onChange={(e) => handleChange(e)}
                          type="checkbox"
                          id={`inline-checkbox-3`}
                        />
                      </ListGroup.Item>
                    );
                  })}
              </ListGroup>
              <ListGroup className="participants">
                {Object.keys(space).length > 0 &&
                  space.caregivers.map((item) => {
                    return (
                      <ListGroup.Item>
                        <Form.Check
                          inline
                          value={JSON.stringify(item)}
                          checked={
                            formData.participants &&
                            formData.participants.some((e) => e.id == item.id)
                          }
                          name="participants"
                          label={`${item.first_name} ${item.last_name}`}
                          type="checkbox"
                          onChange={(e) => handleChange(e)}
                          id={`inline-checkbox-3`}
                        />
                      </ListGroup.Item>
                    );
                  })}
              </ListGroup>
            </div>

            <Form.Check // prettier-ignore
              type="switch"
              id="custom-switch"
              onChange={() => setFormData(prev => ({...prev, private: !prev.private}))}
              label={
                formData.private ? (
                  <>
                    <IoLockClosedOutline /> Privé
                  </>
                ) : (
                  <>
                    <IoLockOpenOutline /> Privé
                  </>
                )
              }
            />
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
