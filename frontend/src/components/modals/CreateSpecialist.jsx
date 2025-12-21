import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/api";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { RxLetterCaseToggle } from "react-icons/rx";
import { LuMessageSquareText } from "react-icons/lu";
import { LuStethoscope } from "react-icons/lu";

export default function CreateSpecialist({
  space,
  setRefreshRecipients,
  show,
  setShow,
}) {
  const { user } = useContext(AuthContext);
  const [addressValue, setAddressValue] = useState();
  const [debouncedValue, setDebouncedValue] = useState();
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    speciality: "",
    contact: "",
    notes: "",
    created_at: "",
    space: space.id,
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
        "http://127.0.0.1:8000/api/healthcare_professionnals/",
        formData
      );
      console.log("Success!", response.data);
      setRefreshRecipients(true);
      handleClose();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!space) return;

    setFormData((prev) => ({
      ...prev,
      space: space.id,
    }));
  }, []);

  useEffect(() => {
    const getAddressSuggestions = async () => {
      if (!debouncedValue) return;

      try {
        const res = await axios.get(
          `https://data.geopf.fr/geocodage/completion/?text=${debouncedValue}`
        );
        setAddressSuggestions(res.data.results);
      } catch (error) {
        console.log(error);
      }
    };

    getAddressSuggestions();
  }, [debouncedValue]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setDebouncedValue(addressValue);
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [addressValue]);

  console.log(formData);

  return (
    <Modal show={show} onHide={handleClose} className="create-specialist-modal">
      <Modal.Header closeButton>
        <Modal.Title>Ajouter un professionel de santé</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form action="" method="post">
          <div className="field">
            <RxLetterCaseToggle />
            <input
              type="text"
              name="name"
              id=""
              placeholder="Nom"
              value={formData.name}
              onChange={(e) => handleChange(e)}
            />
          </div>
          <div className="field">
            <LuStethoscope />
          <input
            type="text"
            name="speciality"
            id=""
            placeholder="Spécialité"
            value={formData.speciality}
            onChange={(e) => handleChange(e)}
            />
            </div>
          <div className="contact-fields">
            <label htmlFor="contact">Contact</label>
            <div className="address">
              <input
                type="text"
                name="address"
                id=""
                value={addressValue}
                onChange={(e) => setAddressValue(e.target.value)}
              />
              {addressSuggestions.length > 0 && (
                <ul className="address-suggestions">
                  {addressSuggestions.map((item) => {
                    return (
                      <li onClick={() => setAddressValue(item.fulltext)}>
                        <HiOutlineLocationMarker /> {item.fulltext}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <input
              type="tel"
              name="birth_date"
              id=""
              value={formData.birth_date}
              onChange={(e) => handleChange(e)}
            />
          </div>
          <div className="field">
            <LuMessageSquareText />
          <textarea
            name="notes"
            id=""
            value={formData.notes}
            onChange={(e) => handleChange(e)}
            ></textarea>
            </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button type="submit" onClick={(e) => handleSubmit(e)}>
          Ajouter
        </Button>
        <Button type="button" variant="secondary" onClick={handleClose}>
          Annuler
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
