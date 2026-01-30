import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/api";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

export default function CreateRecipient({
  space,
  setRefreshRecipients,
  show,
  setShow,
}) {
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    birth_date: "",
    gender: "",
    healthcare_professionals: [],
    medical_info: "",
    space: "",
  });

  const handleClose = () => {
    setShow(false);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post(
        "http://127.0.0.1:8000/api/recipients/",
        formData
      );
      space.recipients.push(response.data)
      handleClose()
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      space: space.id
    }))
  }, [space])


  console.log(formData);

  return (
    <Modal show={show} onHide={handleClose} className="create-recipient-modal">
      <Modal.Header closeButton>
        <Modal.Title>Ajouter un aidé</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form action="" method="post">
          <input
            type="text"
            name="first_name"
            id=""
            placeholder="Prénom"
            value={formData.first_name}
            onChange={(e) => handleChange(e)}
          />
          <input
            type="text"
            name="last_name"
            id=""
            placeholder="Nom"
            value={formData.last_name}
            onChange={(e) => handleChange(e)}
          />
          <div className="field">
            <label htmlFor="birth_date">Date de naissance</label>
            <input
              type="date"
              name="birth_date"
              id=""
              value={formData.birth_date}
              onChange={(e) => handleChange(e)}
            />
          </div>
          <select name="gender" id="" onChange={(e) => handleChange(e)}>
            <option value="" selected>
              Genre
            </option>
            <option value="F">F</option>
            <option value="M">M</option>
            <option value="N">N</option>
          </select>
        </form>
      </Modal.Body>
      <Modal.Footer>
          <Button type="submit" onClick={(e) => handleSubmit(e)}>
            Ajouter
          </Button>
          <Button type="button" variant='secondary' onClick={handleClose}>
            Annuler
          </Button>
      </Modal.Footer>
    </Modal>
  );
}
