import React, { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/api";
import Agenda from "../Agenda";
import { IoLockClosedOutline } from "react-icons/io5";
import { IoLockOpenOutline } from "react-icons/io5";
import { LuClock3 } from "react-icons/lu";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Dropdown from "react-bootstrap/Dropdown";
import moment from "moment";
import "moment/locale/fr";
import { PiTagDuotone } from "react-icons/pi";
import { MdOutlineTitle } from "react-icons/md";
import CreateCategory from "./CreateCategory";
import { FaRegTrashAlt } from "react-icons/fa";
import { ToastContext } from "../../context/ToastContext";
import { LuCalendarPlus } from "react-icons/lu";
import ListGroup from "react-bootstrap/ListGroup";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import { IoIosClose } from "react-icons/io";
import { MdOutlineGroupAdd } from "react-icons/md";
import { HiOutlineBars3BottomLeft } from "react-icons/hi2";

export default function AddEvent({ agenda, show, setShow, preloadedEvent, fetchAgendaItems, setSelectedEvent }) {
  moment.locale("fr");
  const { user, space } = useContext(AuthContext);

  const { setShowToast, setMessage, setColor } = useContext(ToastContext);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [showCaregivers, setShowCaregivers] = useState(false);
  const [searchParticipants, setSearchParticipants] = useState();
  const [participantsList, setParticipantsList] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [participantsListWidth, setParticipantsListWidth] = useState(0);

  const participantsListRef = useRef();

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
    private: false,
    category: "",
    description: "",
    start_date: default_start_date,
    end_date: default_end_date,
    created_by: {},
    created_by_id: "",
    agenda_id: "",
    agenda: {},
    caregivers: [],
    recipients: [],
  });

  const fetchCategory = async () => {
    try {
      const res = await api.get(
        "http://127.0.0.1:8000/api/agenda_item_categories/",
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

  const deselectParticipant = (item) => {
    let key = "";

    if (space.caregivers.some((elem) => elem.id == item.id)) {
      key = "caregivers";
    } else key = "recipients";

    let filter = formData[key].filter((elem) => elem.id !== item.id);
    setFormData((prev) => ({ ...prev, [key]: filter }));
  };

  const selectParticipant = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    let key = "";

    if (space.caregivers.some((elem) => elem.id == item.id)) {
      key = "caregivers";
    } else key = "recipients";
    setFormData((prev) => ({ ...prev, [key]: [...prev[key], item] }));
  };

  const selectCategory = (category) => {
    console.log('select category');

    setFormData((prev) => ({
      ...prev,
      category: category,
    }));

    setSelectedCategory(category);
  };

  const deleteEvent = async () => {
    if(!preloadedEvent.id) return
    if(window.confirm('Supprimer cet événement ?')) {
      try {
        await api.delete(`http://127.0.0.1:8000/api/agenda_items/${preloadedEvent.id}`)
        handleClose()
        fetchAgendaItems()
        setSelectedEvent({})
      } catch (error) {
        console.log(error);
      }
    }
  }


  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(formData);

    try {
      let response = ""
      if(Object.keys(preloadedEvent).length > 0) {
        response = await api.put(
          `http://127.0.0.1:8000/api/agenda_items/${preloadedEvent.id}/`,
          formData,
        );
      } else {
        response = await api.post(
          "http://127.0.0.1:8000/api/agenda_items/",
          formData,
        );
      }
      console.log(response);
      setShowToast(true);
      setMessage("Événement crée avec succès");
      setColor("success");
      handleClose();
    } catch (error) {
      console.log(error);
      setShowToast(true);
      setMessage(
        "Une erreur s'est produite lors de la création de l'événement",
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
        `http://127.0.0.1:8000/api/agenda_item_categories/${id}`,
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleClose = () => {
    if (!preloadedEvent) {
      setFormData({
        title: "",
        private: false,
        category: "",
        description: "",
        start_date: default_start_date,
        end_date: default_end_date,
        created_by: "",
        agenda_id: "",
        caregivers: [],
        recipients: [],
      });
    }
    setShow(false);
  };

  useEffect(() => {
    if (
      agenda &&
      Object.keys(agenda).includes("id") &&
      user &&
      Object.keys(user).includes("id") &&
      space &&
      Object.keys(space).includes("caregivers")
    ) {
      setFormData((prev) => ({
        ...prev,
        agenda: agenda,
        agenda_id: agenda.id,
        created_by_id: user.id,
        created_by: user,
      }));

      setParticipantsList(
        space.caregivers
          .filter((e) => e.user !== user.id)
          .concat(space.recipients),
      );
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
    if (Object.keys(preloadedEvent).length <= 0) {
      setFormData({
        title: "",
        private: false,
        category: "",
        description: "",
        start_date: default_start_date,
        end_date: default_end_date,
        agenda: agenda && agenda,
        agenda_id: (agenda && agenda.id) && agenda.id,
        created_by_id: (user && user.id) && user.id,
        created_by: user && user,
        caregivers: [],
        recipients: [],
      });
    } else {
      preloadedEvent.start_date = moment(preloadedEvent.start_date).format();
      preloadedEvent.end_date = moment(preloadedEvent.end_date).format();
      preloadedEvent.created_by_id = preloadedEvent.created_by.id
      setFormData(preloadedEvent);
    }
  }, [preloadedEvent]);

  

  useEffect(() => {
    if (!user || !user.id || !space) return;
    const all_participants = space.caregivers
      .filter((e) => e.user !== user.id)
      .concat(space.recipients);
    console.log(
      all_participants.filter(
        (elem) => !selectedParticipants.some((e) => e.id == elem.id),
      ),
    );

    setParticipantsList(
      all_participants.filter(
        (elem) => !selectedParticipants.some((e) => e.id == elem.id),
      ),
    );

    if (participantsListRef.current) {
      const width = participantsListRef.current.getBoundingClientRect().width;
      setParticipantsListWidth(width);
    } else {
      setParticipantsListWidth(0);
    }
  }, [selectedParticipants]);

  useEffect(() => {
    setSelectedParticipants(formData.caregivers.concat(formData.recipients));
  }, [formData.caregivers, formData.recipients]);

  useEffect(() => {
    if (!user || !user.id) return;

    let initial_participants = space.caregivers
      .filter((e) => e.user !== user.id)
      .concat(space.recipients);

    if (searchParticipants) {
      let filter = initial_participants.filter((e) =>
        e.first_name.toLowerCase().startsWith(searchParticipants),
      );
      setParticipantsList(filter);
    } else {
      setParticipantsList(initial_participants);
    }
  }, [searchParticipants]);

  useEffect(() => {
    fetchCategory();
  }, []);

  console.log(formData);
  console.log(preloadedEvent);

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
          <Modal.Title>
            <LuCalendarPlus /> {Object.keys(preloadedEvent).length > 0 ? "Modifier" : "Ajouter"} un événement
          </Modal.Title>{" "}
          <Dropdown className="categories-dropdown">
            <Dropdown.Toggle id="dropdown-basic">
              {selectedCategory ? (
                <>
                  <div className="label">
                    <PiTagDuotone
                      style={{ color: selectedCategory.color.text }}
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
                        <PiTagDuotone
                          style={{ color: category.color.background }}
                        />
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
              {selectedCategory && (
                <Dropdown.Item onClick={() => setSelectedCategory(null)}>
                  Effacer
                </Dropdown.Item>
              )}
            </Dropdown.Menu>
          </Dropdown>
          <Form.Check
            type="switch"
            id="custom-switch"
            checked={formData.private}
            onChange={() =>
              setFormData((prev) => ({ ...prev, private: !prev.private }))
            }
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
        </Modal.Header>
        <Modal.Body>
          <Form action="" className="add-event">
            <MdOutlineTitle />
            <FloatingLabel
              controlId="floatingInput"
              label="Titre de l'événement"
              className=""
            >
              <Form.Control
                type="text"
                name="title"
                size="sm"
                id=""
                placeholder="Titre de l'événement"
                value={formData.title}
                onChange={handleChange}
              />
            </FloatingLabel>
            <MdOutlineGroupAdd />
            <div className="add-participants">
              <div className="field">
                {selectedParticipants.length > 0 && (
                  <div
                    className="participants"
                    ref={participantsListRef}
                    style={{ width: "max-content" }}
                  >
                    {selectedParticipants.map((participant) => {
                      return (
                        <span>
                          {participant.first_name} {participant.last_name}{" "}
                          <IoIosClose
                            onClick={() => deselectParticipant(participant)}
                          />
                        </span>
                      );
                    })}
                  </div>
                )}
                <Form.Control
                  type="text"
                  name="participants"
                  size="sm"
                  id=""
                  style={{ paddingLeft: `${participantsListWidth + 10}px` }}
                  placeholder={
                    selectedParticipants.length > 0 ? "" : "Participants"
                  }
                  onFocus={() => setShowCaregivers(true)}
                  onBlur={() =>
                    setTimeout(() => {
                      setShowCaregivers(false);
                    }, 500)
                  }
                  onChange={(e) =>
                    setSearchParticipants(e.target.value.toLowerCase())
                  }
                />
              </div>
              {showCaregivers && (
                <ListGroup style={{ left: `${participantsListWidth + 5}px` }}>
                  {participantsList
                    .sort((a, b) =>
                      a.first_name > b.first_name
                        ? 1
                        : b.first_name > a.first_name
                          ? -1
                          : 0,
                    )
                    .map((item) => {
                      return (
                        <ListGroup.Item
                          onClick={(e) => selectParticipant(e, item)}
                        >
                          {item.first_name} {item.last_name}
                        </ListGroup.Item>
                      );
                    })}
                </ListGroup>
              )}
            </div>
            <HiOutlineBars3BottomLeft />
            <FloatingLabel
              controlId="floatingTextarea"
              label="Description"
              className=""
            >
              <Form.Control
                as="textarea"
                size="sm"
                name="description"
                onChange={handleChange}
                placeholder="Description"
                style={{ height: "100px" }}
                value={formData.description}
              />
            </FloatingLabel>
            <LuClock3 />
            <div className="field dates">
              <div className="date-field">
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
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleSubmit}>{Object.keys(preloadedEvent).length > 0 ? "Modifier" : "Créer"}</Button>
          {Object.keys(preloadedEvent).length > 0 && 
          <Button variant="outline-danger" onClick={deleteEvent}>
            Supprimer
          </Button>
          }
          <Button variant="outline-secondary" onClick={handleClose}>
            Annuler
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
