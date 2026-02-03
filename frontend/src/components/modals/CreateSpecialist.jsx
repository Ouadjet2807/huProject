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
import { LuPhone } from "react-icons/lu";
import { TiContacts } from "react-icons/ti";
import { FaUserMd } from "react-icons/fa";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import FloatingLabel from "react-bootstrap/FloatingLabel";

export default function CreateSpecialist({ space, show, setShow, recipient }) {
  const { user } = useContext(AuthContext);
  const [placeholderSuggestion, setPlaceholderSuggestion] = useState();
  const [debouncedValue, setDebouncedValue] = useState();
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [contact, setContact] = useState({
    address: "",
    phone_number: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    contact: "",
    notes: "",
    space: "",
  });

  const handleTelField = (e) => {
    if (/^[A-Z]$/gi.test(e.target.value)) return;

    let regex = /^[^0][^A-Z]*\d*$/gi;

    let value = e.target.value;
    let isValid = regex.test(e.target.value);
    console.log(isValid);

    console.log(value.match(regex));

    if (isValid) {
      setContact((prev) => ({
        ...prev,
        phone_number: value.match(regex),
      }));
    } else if (value === "") {
      setContact((prev) => ({
        ...prev,
        phone_number: value,
      }));
    }
  };

  const handleClose = () => {
    setShow(false);
  };

  const handleChange = (e) => {
    console.log(e);

    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(formData);

    if (!formData.space) return;

    try {
      const response = await api.post(
        "http://127.0.0.1:8000/api/healthcare_professionals/",
        formData,
      );

      let update_recipient = recipient;

      update_recipient.healthcare_professionals.push(response.data);

      await api.put(
        `http://127.0.0.1:8000/api/recipients/${recipient.id}/`,
        update_recipient,
      );

      recipient.healthcare_professionals.push(response.data);

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
  }, [space]);

  useEffect(() => {
    const getAddressSuggestions = async () => {
      if (!debouncedValue || debouncedValue === "") {
        setAddressSuggestions([]);
        return;
      }

      try {
        const res = await axios.get(
          `https://data.geopf.fr/geocodage/completion/?text=${debouncedValue}`,
        );
        setAddressSuggestions(res.data.results);
      } catch (error) {
        console.log(error);
      }
    };

    getAddressSuggestions();
  }, [debouncedValue]);

  useEffect(() => {
    let addressValue = contact.address;

    if (
      addressSuggestions &&
      addressSuggestions.some(
        (e) => e.fulltext.toUpperCase() === addressValue.toUpperCase(),
      )
    ) {
      setAddressSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      setDebouncedValue(addressValue);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [contact.address]);

  useEffect(() => {
    if (!addressSuggestions || addressSuggestions.length <= 0) return;

    let placeholder = addressSuggestions.find((e) =>
      e.fulltext.toUpperCase().includes(contact.address.toUpperCase()),
    );

    if (placeholder && placeholder.fulltext.toLowerCase().startsWith(contact.address.toLowerCase())) {
      setPlaceholderSuggestion(placeholder.fulltext);
    } else {
      setPlaceholderSuggestion('')
    }
  }, [addressSuggestions, contact.address]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      contact: JSON.stringify(contact),
    }));
  }, [contact]);

  console.log(formData);
  console.log(contact);
  console.log(addressSuggestions);
  console.log(recipient);

  return (
    <Modal show={show} onHide={handleClose} className="create-specialist-modal">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaUserMd /> Ajouter un professionel de santé
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form action="" method="post">
          <InputGroup className="">
            <InputGroup.Text id="basic-addon1">
              <RxLetterCaseToggle />
            </InputGroup.Text>
            <FloatingLabel controlId="floatingInput" label="Nom" className="">
              <Form.Control
                aria-label="Nom"
                aria-describedby="basic-addon1"
                placeholder="Nom"
                name="name"
                value={formData.name}
                onChange={(e) => handleChange(e)}
              />
            </FloatingLabel>
          </InputGroup>
          <InputGroup className="">
            <InputGroup.Text id="basic-addon2">
              <LuStethoscope />
            </InputGroup.Text>
            <FloatingLabel
              controlId="floatingInput"
              label="Spécialité"
              className=""
            >
              <Form.Control
                aria-label="Spécialité"
                aria-describedby="basic-addon2"
                placeholder="Spécialité"
                name="specialty"
                value={formData.specialty}
                onChange={(e) => handleChange(e)}
              />
            </FloatingLabel>
          </InputGroup>
          <label htmlFor="contact" className="contact-label">
            <TiContacts /> Contact
          </label>
          <div className="contact-fields">
            <InputGroup className="address-field">
              <InputGroup.Text id="basic-addon3">
                <HiOutlineLocationMarker />
              </InputGroup.Text>
              <FloatingLabel
                controlId="floatingInput"
                label="Adresse"
                className=""
              >
                <Form.Control
                  aria-label="Adresse"
                  aria-describedby="basic-addon3"
                  placeholder="Adresse"
                  name="address"
                  value={contact.address}
                  onChange={(e) =>
                    setContact((prev) => ({ ...prev, address: e.target.value }))
                  }
                />
                {placeholderSuggestion && (
                  <span className="suggestion" htmlFor="address">
                    {placeholderSuggestion}
                  </span>
                )}
              </FloatingLabel>
            </InputGroup>
            {addressSuggestions && addressSuggestions.length > 0 && (
              <ul className="address-suggestions">
                {addressSuggestions.map((item) => {
                  return (
                    <li
                      onClick={() =>
                        setContact((prev) => ({
                          ...prev,
                          address: item.fulltext,
                        }))
                      }
                    >
                      <HiOutlineLocationMarker /> {item.fulltext}
                    </li>
                  );
                })}
              </ul>
            )}
            <InputGroup className="tel-field mt-3">
              <InputGroup.Text>
                <LuPhone />
              </InputGroup.Text>
              <InputGroup.Text>+33</InputGroup.Text>

              <Form.Control
                aria-label="Téléphone"
                aria-describedby="basic-addon4"
                placeholder="Téléphone"
                name="address"
                value={contact.phone_number}
                maxLength={9}
                id=""
                onChange={(e) => handleTelField(e)}
              />
            </InputGroup>
          </div>
          <InputGroup className="notes">
            <InputGroup.Text id="basic-addon2">
              <LuMessageSquareText />
            </InputGroup.Text>
            <FloatingLabel controlId="floatingInput" label="Notes" className="">
              <Form.Control
                as="textarea"
                aria-label="Spécialité"
                aria-describedby="basic-addon2"
                placeholder="Notes"
                name="notes"
                value={formData.notes}
                onChange={(e) => handleChange(e)}
              />
            </FloatingLabel>
          </InputGroup>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="md-green"
          type="submit"
          onClick={(e) => handleSubmit(e)}
        >
          Ajouter
        </Button>
        <Button type="button" variant="outline-secondary" onClick={handleClose}>
          Annuler
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
