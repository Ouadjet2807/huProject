import React, { useState, useEffect, useContext } from "react";
import { ToastContext } from "../../context/ToastContext";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { AuthContext } from "../../context/AuthContext";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import "moment/locale/fr";
import api from "../../api/api";
import { useSelector } from "react-redux";
import { MdOutlineSend } from "react-icons/md";
import Loader from "../Loader";

export default function InviteUserModal({ show, setShow }) {
  const { setShowToast, setToastMessage, setColor } = useContext(ToastContext);
  const [buttonPending, setButtonPending] = useState(false);

  moment.locale("fr");
  const { user } = useContext(AuthContext);
  const space = useSelector((state) => state.space);
  const [formData, setFormData] = useState({
    email: "",
    role: 3,
    space: "",
    sender: "",
    token: "",
    accepted: false,
  });

  const roles = [{ administrateur: 1 }, { editeur: 2 }, { lecteur: 3 }];

  const handleChange = (e) => {
    window.location.pathname.includes("invite");
    if (!e.target.value) return;

    let value =
      e.target.type === "email" ? e.target.value : parseInt(e.target.value);

    setFormData((prev) => ({
      ...prev,
      [e.target.name]: value,
    }));
  };

  const handleSubmit = async () => {
    setButtonPending(true);
    try {
      let post = await api.post(
        "https://www.curadash.fr/api/invitations/",
        formData,
      );
      console.log("Success", post);
      setColor("success");
      setToastMessage("L'invitation à été envoyée avec succès !");
      setShow(false);
    } catch (error) {
      console.log(Object.entries(error));
      setToastMessage(
        "Une erreur s'est produite, l'invitation n'a pas été envoyée",
      );
      setColor("danger");
    }
    setButtonPending(false);
    setShowToast(true);
  };

  const handleClose = () => {
    setShow(false);
  };

  useEffect(() => {
    if (!user) return;
    setFormData((prev) => ({
      ...prev,
      sender: user.id,
      space: space.id,
      token: uuidv4(),
    }));
  }, [space, user]);

  return (
    <Modal show={show} onHide={handleClose} id="inviteUserModal">
      <Modal.Header closeButton>
        <Modal.Title data-testid="title">Inviter une personne</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Saisissez l'adresse email de la personne que vous souhaitez inviter
          ainsi que son niveau d'accès
        </p>
        <form action="">
          <Form.Control
            type="email"
            size="sm"
            name="email"
            id=""
            aria-describedby="basic-addon"
            onChange={(e) => handleChange(e)}
            placeholder="Email"
          />
          <Form.Select
            data-testid="accessLevelInput"
            name="access_level"
            id=""
            onChange={(e) => handleChange(e)}
          >
            <option disabled>Choisissez un rôle</option>
            {roles.map((item) => {
              return (
                <option value={Object.values(item)[0]}>
                  {Object.keys(item)[0]}
                </option>
              );
            })}
          </Form.Select>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <div
          className="button-container"
          style={{
            display: "flex",
            gap: "15px",
            alignItems: "center",
            marginTop: buttonPending ? 0 : "0.9vw",
            marginLeft: buttonPending ? "-5.8vw" : 0,
          }}
        >
          {buttonPending && <Loader />}
          <Button
            variant="aqua"
            disabled={buttonPending}
            onClick={handleSubmit}
          >
            <MdOutlineSend /> Envoyer une invitation
          </Button>
        </div>

        <Button variant="outline-secondary" onClick={handleClose}>
          Annuler
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
