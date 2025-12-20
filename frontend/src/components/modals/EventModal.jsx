import React, { use, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { CiClock2 } from "react-icons/ci";
import { RxTextAlignLeft } from "react-icons/rx";
import api from "../../api/api";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { IoPeopleOutline } from "react-icons/io5";
import { useState } from "react";
import { CiEdit } from "react-icons/ci";
import moment from "moment";
import "moment/locale/fr";
import { FaRegTrashAlt } from "react-icons/fa";
import { CiShoppingTag } from "react-icons/ci";
import Dropdown from "react-bootstrap/Dropdown";
import CreateCategory from "./CreateCategory";
import { FaTag } from "react-icons/fa6";
import { IoLockClosedOutline } from "react-icons/io5";
import { IoLockOpenOutline } from "react-icons/io5";
import { ToastContext } from "../../context/ToastContext";

export default function EventModal({
  event,
  setShow,
  show,
  categories,
  agenda,
}) {
  moment.locale("fr");
  const { space, user } = useContext(AuthContext);
    const { setShowToast, setMessage, setColor } = useContext(ToastContext);

  const [eventCreator, setEventCreator] = useState();
  const [editionMode, setEditionMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState();
  const [editFormData, setEditFormData] = useState(event);
  const [showCreateCategory, setShowCreateCategory] = useState(false);

  const handleClose = () => {
    setShow(false);
    setEditionMode(false);
  };

  const date_options = {
    weekday: "short",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  };

  const selectCategory = (category) => {
    setEditFormData((prev) => ({
      ...prev,
      category: category.id,
    }));

    setSelectedCategory(category);
  };

  const getCreator = async (id) => {
    let creator = ""

    if(!id) return ""

    try {
      const res = await api.get(`http://127.0.0.1:8000/api/user/${id}`);

      creator = res.data.first_name + " " + res.data.last_name;
      if (user && event.created_by === user.id) creator = "vous";

    } catch (error) {
      console.log(error);
    }
    finally {


      return creator;
    }
  };

  const canEdit = () => {

    if(!user || !space) return
    let caregiver = space.caregivers.find(e => e.user === user.id)

    if (caregiver && caregiver.access_level < 3) return true

    return false

  }

  const getParticipant = (key, id) => {
    const person = space[key].filter((item) => item.id == id);

    const name = person[0].first_name + " " + person[0].last_name;

    console.log(name);

    return name;
  };

  const handleChange = (e) => {
    e.stopPropagation();
    e.preventDefault();
    let value = e.target.value;
    let key = e.target.name;

    if (e.target.type === "date" || e.target.type === "time") {
      key = `${e.target.name.split("_")[0]}_date`;
      console.log(editFormData[key]);
      let initialDate = moment(editFormData[key]).format();

      value =
        e.target.name.split("_")[1] === "time"
          ? moment(`${initialDate.slice(0, 10)} ${e.target.value}`)
          : moment(`${e.target.value} ${initialDate.slice(11, 16)}`)
    } else if (e.target.type === "select-multiple") {
      let intValue = parseInt(e.target.value);

      value = !editFormData[key].includes(intValue)
        ? [intValue]
        : editFormData[key].splice(editFormData[key].indexOf(intValue), 1);
    } else if (e.target.type === "checkbox") {
       value = e.target.checked
    }

    setEditFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleDelete = async () => {
    if (
      window.confirm("Êtes-vous sûr(e) de vouloir supprimer cet événement ?")
    ) {
      try {
        await api.delete(`http://127.0.0.1:8000/api/agenda_items/${event.id}`);

        handleClose();
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleUpdate = async () => {
    try {
      await api.put(
        `http://127.0.0.1:8000/api/agenda_items/${event.id}/`,
        editFormData
      );
      console.log("Success");
       setShowToast(true)
      setMessage("Événement modifié avec succès")
      setColor("success")
      handleClose();
    } catch (error) {
      console.log(error);
      setShowToast(true)
      setMessage("Une erreur s'est produite lors de la modification de l'événement")
      setColor("danger")
    }
  };

  useEffect(() => {
    if (event.category && categories.length > 0) {
      setSelectedCategory(categories.find((e) => e.id == event.category));
    }
  }, []);

  useEffect(() => {
    console.log(event);
    
    setEditFormData(event);
  }, [editionMode]);

  useEffect(() => {
    if (editFormData.start_date) {
      let end_date = moment(editFormData.start_date).add(1, "hours").local();

      setEditFormData((prev) => ({
        ...prev,
        end_date: end_date.format(),
      }));
    }
  }, [editFormData.start_date]);

  useEffect(() => {
    setEventCreator(getCreator(event.created_by));
  }, [user])

  console.log(editFormData);
  console.log(eventCreator);

  return (
    <>
      <CreateCategory
        show={showCreateCategory}
        setShow={setShowCreateCategory}
        agenda={agenda}
      />
      <Modal show={show} onHide={handleClose} className="event-modal">
        {Object.keys(event).length > 0 && (
          <>
            {!editionMode ? (
              <>
                <Modal.Header closeButton>
                  <div className="info">
                    <Modal.Title>{event.title}</Modal.Title>
                    <span>
                      créé {eventCreator && <>par {eventCreator}</>} le{" "}
                      {new Date(
                        event.created_at.slice(0, 10)
                      ).toLocaleDateString("fr-Fr", date_options)}
                    </span>
                  </div>
                </Modal.Header>
                <Modal.Body>
                  <div className="date">
                    <CiClock2 />
                    <span>
                      {event.start_date
                        .toLocaleDateString("fr-Fr", date_options)
                        .slice(0, 21)}
                      - {event.end_date.toLocaleString().slice(10, 16)}
                    </span>
                  </div>
                  <div className="category">
                    <CiShoppingTag />
                    {event.category && categories.length > 0
                      ? categories.find((e) => e.id == event.category).name
                      : "Non catégorisé"}
                  </div>
                  <p className="description">
                    <RxTextAlignLeft />
                    {event.description !== ""
                      ? event.description
                      : "Aucune description"}
                  </p>
                  <div className="participants">
                    <div className="icon">
                      <IoPeopleOutline />
                    </div>
                    <div className="columns">
                      <div className="column">
                        <span>Participants</span>
                        <ul>
                          {event.participants.map((item) => {
                            return (
                              <li>{getParticipant("caregivers", item)}</li>
                            );
                          })}
                        </ul>
                      </div>
                      <div className="column">
                        <span>Aidé</span>
                        <ul>
                          {event.recipients.map((item) => {
                            return (
                              <li>{getParticipant("recipients", item)}</li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  </div>
                </Modal.Body>
              </>
            ) : (
              <form action="">
                <Modal.Header closeButton>
                  <div className="info">
                    <Modal.Title>
                      <input
                        type="text"
                        name="title"
                        value={editFormData.title}
                        onChange={(e) => handleChange(e)}
                      ></input>
                    </Modal.Title>
                    <span>
                      créé par {eventCreator} le{" "}
                      {Object.keys(editFormData).length > 0 &&
                        new Date(
                          editFormData.created_at.slice(0, 10)
                        ).toLocaleDateString("fr-Fr", date_options)}
                    </span>
                  </div>
                </Modal.Header>
                <Modal.Body>
                  <div className="date">
                    <CiClock2 />
                    <div className="date-inputs">
                      <input
                        type="date"
                        name="start_date"
                        id=""
                        value={
                          Object.keys(editFormData).length > 0 &&
                          moment(editFormData.start_date)
                            .format()
                            .slice(0, 10)
                        }
                        onChange={(e) => handleChange(e)}
                      />
                      <input
                        type="time"
                        name="start_time"
                        id=""
                        value={
                          Object.keys(editFormData).length > 0 &&
                          moment(editFormData.start_date)
                            .format()
                            .slice(11, 16)
                        }
                        onChange={(e) => handleChange(e)}
                      />
                      <input
                        type="time"
                        name="end_time"
                        id=""
                        value={
                          Object.keys(editFormData).length > 0 &&
                          moment(editFormData.end_date)
                            .format()
                            .slice(11, 16)
                        }
                        onChange={(e) => handleChange(e)}
                      />
                    </div>
                  </div>
                  <div className="categories">
                    {selectedCategory ? (
                      <CiShoppingTag
                        style={{ color: selectedCategory.color.text }}
                      />
                    ) : (
                      <CiShoppingTag />
                    )}
                    <Dropdown className="categories-dropdown">
                      <Dropdown.Toggle id="dropdown-basic">
                        {selectedCategory ? selectedCategory.name : "Catégorie"}
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
                                  <FaTag
                                    style={{ color: category.color.background }}
                                  />
                                  {category.name}
                                </div>
                              </Dropdown.Item>
                            );
                          })}
                        <Dropdown.Divider />
                        <Dropdown.Item
                          onClick={() => setShowCreateCategory(true)}
                        >
                          Nouvelle catégorie
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                  <p>
                    <RxTextAlignLeft />
                    <textarea
                      name="description"
                      id=""
                      value={editFormData.description}
                      rows={5}
                      onChange={(e) => handleChange(e)}
                    ></textarea>
                  </p>
                  <div className="participants">
                    <div className="icon">
                      <IoPeopleOutline />
                    </div>
                    <div className="columns">
                      <div className="column">
                        <span>Participants</span>
                        <select
                          name="participants"
                          multiple
                          onChange={(e) => handleChange(e)}
                        >
                          {Object.keys(space).length > 0 &&
                            space.caregivers.map((item) => {
                              return (
                                <option
                                  value={item.id}
                                  className={`${
                                    Object.keys(editFormData).length > 0 &&
                                    editFormData.participants.includes(item.id)
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
                      <div className="column">
                        <span>Aidé</span>
                        <select
                          name="recipients"
                          multiple
                          onChange={(e) => handleChange(e)}
                        >
                          {Object.keys(space).length > 0 &&
                            space.recipients.map((item) => {
                              return (
                                <option
                                  value={item.id}
                                  className={`${
                                    Object.keys(editFormData).length > 0 &&
                                    editFormData.recipients.includes(item.id)
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
                    </div>
                  </div>
                  <div
                    className={`field ${editFormData.private ? "checked" : ""}`}
                    id="private"
                  >
                    <input
                      type="checkbox"
                      name="private"
                      id=""
                      checked={editFormData.private}
                      onChange={handleChange}
                    />
                    <label htmlFor="">
                      {editFormData.private ? (
                        <IoLockClosedOutline />
                      ) : (
                        <IoLockOpenOutline />
                      )}{" "}
                      Privé
                    </label>
                  </div>
                </Modal.Body>
              </form>
            )}
            <Modal.Footer>
              {event.created_by == user.id || canEdit() && (
                <>
                  <Button variant="danger" onClick={() => handleDelete()}>
                    <FaRegTrashAlt />
                    Supprimer
                  </Button>
                  {editionMode ? (
                    <Button variant="primary" onClick={() => handleUpdate()}>
                      <CiEdit />
                      Enregistrer
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={() => setEditionMode(true)}
                    >
                      <CiEdit />
                      Modifier
                    </Button>
                  )}
                </>
              )}
              <Button variant="secondary" onClick={handleClose}>
                Fermer
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </>
  );
}
