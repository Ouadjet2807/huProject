import React, { use, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
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
import ListGroup from "react-bootstrap/ListGroup";

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

  const canEdit = () => {
    if (!user || !space) return;
    let caregiver = space.caregivers.find((e) => e.user === user.id);

    if (caregiver && caregiver.access_level < 3) return true;

    return false;
  };

  const handleChange = (e) => {
    e.stopPropagation();
    let value = "";
    let key = e.target.name;

    if (e.target.type === "date" || e.target.type === "time") {
      key = `${e.target.name.split("_")[0]}_date`;
      console.log("date");
      let initialDate = moment(editFormData[key]).format();

      value =
        e.target.name.split("_")[1] === "time"
          ? moment(`${initialDate.slice(0, 10)} ${e.target.value}`)
          : moment(`${e.target.value} ${initialDate.slice(11, 16)}`);
    } else if (e.target.type === "checkbox") {
      console.log(e.target.value);

      const parsed_value = JSON.parse(e.target.value);
      if (
        e.target.checked &&
        !editFormData[key].some((e) => e.id == parsed_value.id)
      ) {
        editFormData[key].push(parsed_value);
        value = editFormData[key];
      } else {
        console.log("uncheck");
        value = editFormData[key].filter((item) => item.id !== parsed_value.id);
      }
    }
    console.log(e.target.type);
    console.log(key);
    console.log(value);
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
    editFormData.created_by_id = editFormData.created_by.id;

    console.log(editFormData);
    try {
      await api.put(
        `http://127.0.0.1:8000/api/agenda_items/${event.id}/`,
        editFormData
      );
      console.log("Success");
      setShowToast(true);
      setMessage("Événement modifié avec succès");
      setColor("success");
      handleClose();
    } catch (error) {
      console.log(error);
      setShowToast(true);
      setMessage(
        "Une erreur s'est produite lors de la modification de l'événement"
      );
      setColor("danger");
    }
  };

  useEffect(() => {
    if (event.category && categories.length > 0) {
      setSelectedCategory(categories.find((e) => e.id == event.category));
    }
  }, []);

  useEffect(() => {
    setEditFormData(event);
  }, [editionMode]);

  // useEffect(() => {
  //   if (editFormData.start_date) {
  //     let end_date = moment(editFormData.start_date).add(1, "hours").local();

  //     setEditFormData((prev) => ({
  //       ...prev,
  //       end_date: end_date.format(),
  //     }));
  //   }
  // }, [editFormData.start_date]);

  useEffect(() => {
    if (!user || !user.id || !event.created_by) return;
    setEventCreator(
      event.created_by.id === user.id
        ? "vous"
        : `${event.created_by.first_name} ${event.created_by.first_name}`
    );
  }, [user]);

  console.log(editFormData);

  return (
    <>
      <CreateCategory
        show={showCreateCategory}
        setShow={setShowCreateCategory}
        agenda={agenda}
      />
      <Modal size="lg" show={show} onHide={handleClose} className="event-modal">
        {Object.keys(event).length > 0 && (
          <>
            {!editionMode ? (
              <>
                <Modal.Header closeButton>
                  <div className="info">
                    <Modal.Title>{event.title}</Modal.Title>
                    <span>
                      créé {eventCreator ? <>par {eventCreator}</> : ""} le{" "}
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
                    {event.category ? event.category.name : "Non catégorisé"}
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
                              <li>
                                {item.first_name} {item.last_name}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                      <div className="column">
                        <span>Aidé</span>
                        <ul>
                          {event.recipients.map((item) => {
                            return (
                              <li>
                                {item.first_name} {item.last_name}
                              </li>
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
                          moment(editFormData.start_date).format().slice(0, 10)
                        }
                        onChange={(e) => handleChange(e)}
                      />
                      <input
                        type="time"
                        name="start_time"
                        id=""
                        value={
                          Object.keys(editFormData).length > 0 &&
                          moment(editFormData.start_date).format().slice(11, 16)
                        }
                        onChange={(e) => handleChange(e)}
                      />
                      <input
                        type="time"
                        name="end_time"
                        id=""
                        value={
                          Object.keys(editFormData).length > 0 &&
                          moment(editFormData.end_date).format().slice(11, 16)
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
                        <ListGroup className="participants">
                          {Object.keys(space).length > 0 &&
                            space.caregivers.map((item) => {
                              return (
                                <ListGroup.Item>
                                  <Form.Check
                                    inline
                                    value={JSON.stringify(item)}
                                    checked={
                                      editFormData.participants &&
                                      editFormData.participants.some(
                                        (e) => e.id == item.id
                                      )
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
                      <div className="column">
                        <span>Aidé</span>
                        <ListGroup className="recipients">
                          {Object.keys(space).length > 0 &&
                            space.recipients.map((item) => {
                              return (
                                <ListGroup.Item>
                                  <Form.Check
                                    inline
                                    value={JSON.stringify(item)}
                                    checked={
                                      editFormData.recipients &&
                                      editFormData.recipients.some(
                                        (e) => e.id == item.id
                                      )
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
              {((event.created_by && event.created_by.id === user.id) ||
                canEdit()) && (
                <>
                  <Button
                    variant="outline-danger"
                    onClick={() => handleDelete()}
                  >
                    <FaRegTrashAlt />
                    Supprimer
                  </Button>
                  {editionMode ? (
                    <Button
                      variant="outline-primary"
                      onClick={() => handleUpdate()}
                    >
                      <CiEdit />
                      Enregistrer
                    </Button>
                  ) : (
                    <Button
                      variant="outline-primary"
                      onClick={() => setEditionMode(true)}
                    >
                      <CiEdit />
                      Modifier
                    </Button>
                  )}
                </>
              )}
              <Button variant="outline-secondary" onClick={handleClose}>
                Fermer
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </>
  );
}
