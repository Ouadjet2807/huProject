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

export default function CreateSpecialist({
  space,
  setRefreshRecipients,
  show,
  setShow,
}) {
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
      if(/^[A-Z]$/gi.test(e.target.value)) return

      let regex = /^[^0][^A-Z]*\d*$/gi;

      let value = e.target.value;
      let isValid = regex.test(e.target.value);
      console.log(isValid);

      console.log(value.match(regex));

    if(isValid) {
      setContact((prev) => ({
        ...prev,
        phone_number: value.match(regex)
      }));
    } else if (value === '') {

        setContact((prev) => ({
        ...prev,
        phone_number: value
      }));
    }
  };

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

    console.log(formData);

    if(!formData.space) return
    
    try {
      const response = await api.post(
        "http://127.0.0.1:8000/api/healthcare_professionals/",
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
  }, [space]);

  useEffect(() => {
    const getAddressSuggestions = async () => {
      if (!debouncedValue || debouncedValue === "") {
        setAddressSuggestions([]);
        return;
      }

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

    let addressValue = contact.address

    if(addressSuggestions && addressSuggestions.some(e => e.fulltext.toUpperCase() === addressValue.toUpperCase())) {
        setAddressSuggestions([])
        return
    }

    const delayDebounceFn = setTimeout(() => {
      setDebouncedValue(addressValue);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [contact.address]);

  useEffect(() => {
    if(!addressSuggestions || addressSuggestions.length <= 0) return

    let placeholder = addressSuggestions.find(e => e.fulltext.toUpperCase().includes(contact.address.toUpperCase()))

    if(!placeholder) return
    
    setPlaceholderSuggestion(placeholder.fulltext)
  }, [addressSuggestions, contact.address])

  useEffect(() => {
       setFormData(prev => ({
      ...prev, 
      contact: JSON.stringify(contact)
    }))
  }, [contact])


  console.log(formData);
  console.log(contact);
  console.log(addressSuggestions);

  return (
    <Modal show={show} onHide={handleClose} className="create-specialist-modal">
      <Modal.Header closeButton>
        <Modal.Title><FaUserMd /> Ajouter un professionel de santé</Modal.Title>
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
              name="specialty"
              id=""
              placeholder="Spécialité"
              value={formData.specialty}
              onChange={(e) => handleChange(e)}
            />
          </div>
            <label htmlFor="contact" className="contact-label"><TiContacts/> Contact</label>
          <div className="contact-fields">
            <div className="address">
              <div className="field">
                <HiOutlineLocationMarker />
                <input
                  type="text"
                  name="address"
                  placeholder="Adresse"
                  id=""
                  value={contact.address}
                  onChange={(e) => setContact(prev => ({...prev, address: e.target.value}))}
                />
                {placeholderSuggestion && (
                  <label className="suggestion" htmlFor="address">
                  {placeholderSuggestion}
                  </label>
                )}
              </div>
              {addressSuggestions && addressSuggestions.length > 0 && (
                <ul className="address-suggestions">
                  {addressSuggestions.map((item) => {
                    return (
                      <li onClick={() => setContact(prev => ({...prev, address: item.fulltext}))}>
                        <HiOutlineLocationMarker /> {item.fulltext}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <div className="field">
              <LuPhone />
              <input
                type="tel"
                name="phone_number"
                placeholder="Téléphone"
                value={contact.phone_number}
                maxLength={9}
                id=""
                onChange={(e) => handleTelField(e)}
              />
              <label htmlFor="phone_number">+ 33</label>
            </div>
          </div>
          <div className="field textarea">
            <LuMessageSquareText />
            <textarea
              name="notes"
              placeholder="Notes"
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
